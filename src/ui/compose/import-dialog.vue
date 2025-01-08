<script setup lang="ts">
	import { computed, ref } from "vue";
	import { extendState, extendStateFromCompressed, getPatternFromState, normalizeState, songExists, State } from "../../state/state";
	import { stringToObject } from "../../utils";
	import { patternEquals } from "../../state/pattern";
	import { songContainsPattern } from "../../state/song";
	import { injectStateRequired } from "../../services/state";
	import { useModal } from "../utils/modal";
	import vTooltip from "../utils/tooltip";
	import { useI18n } from "../../services/i18n";

	const emit = defineEmits<{
		hidden: [];
	}>();

	const state = injectStateRequired();

	const i18n = useI18n();

	const importSongs = ref<Record<number, boolean>>({});
	const importPatterns = ref<Record<string, Record<string, boolean>>>({});

	const pasted = ref("");

	const modalRef = ref<HTMLElement>();
	const modal = useModal(modalRef, {
		onHidden: () => {
			emit("hidden");
		}
	});

	const parsed = computed(() => {
		const result: { state?: State, error?: string, warnings: string[] } = { warnings: [] };

		if(!pasted.value)
			return result;

		const trimmed = pasted.value.trim();

		try {
			let m;
			if(trimmed.charAt(0) == "{" || (m = trimmed.match(/#(\/compose)?\/([-_a-zA-Z0-9]+)/))) {
				const state = normalizeState({ tunes: { } });
				result.warnings = extendStateFromCompressed(state, m ? stringToObject(m[2]) : JSON.parse(trimmed), null, null, false, false, true);
				result.state = state;
			}
			else
				result.error = i18n.t("import-dialog.unrecognized-format-error");
		} catch(e: any) {
			// eslint-disable-next-line no-console
			console.error(e.stack || e);
			result.error = i18n.t("import-dialog.decoding-error", { message: `${e.message || e}` });
		}

		return result;
	});

	const songInfo = computed(() => {
		if(!parsed.value.state)
			return [];

		return parsed.value.state.songs.map((song, songIdx) => {
			return {
				shouldImport: !songExists(state.value, song) && (importSongs.value[songIdx] ?? true),
				exists: songExists(state.value, song),
				name: song.name || i18n.t("general.untitled-song")
			};
		});
	});

	const tuneInfo = computed(() => {
		if(!parsed.value.state)
			return {};

		return Object.fromEntries(Object.entries(parsed.value.state.tunes).map(([tuneName, tune]) => {
			const patterns = Object.fromEntries(Object.entries((parsed.value.state as State).tunes[tuneName].patterns).map(([patternName, pattern]) => {
				const isUsed = parsed.value.state!.songs.some((song, songIdx) => songContainsPattern(song, tuneName, patternName) && songInfo.value[songIdx].shouldImport);

				const existingPattern = getPatternFromState(state.value, tuneName, patternName);
				const exists = !existingPattern ? 0 : patternEquals(existingPattern, pattern) ? 2 : 1;

				const shouldImport = exists === 2 ? false : (isUsed && !exists) ? true : (importPatterns.value[tuneName]?.[patternName] ?? !exists);

				return [patternName, {
					shouldImport,
					isUsed,
					exists,
					clickable: (!isUsed || exists) && exists != 2
				}];
			}));

			const importNone = Object.values(patterns).every((pattern) => !pattern.shouldImport);
			const importAll = Object.values(patterns).every((pattern) => pattern.shouldImport);

			return [tuneName, {
				displayName: state.value.tunes[tuneName]?.displayName || tuneName,
				shouldImport: importNone ? 0 : importAll ? 2 : 1,
				className: importAll ? "active" : importNone ? "" : "list-group-primary",
				patterns
			}];
		}));
	});

	const clickSong = (idx: number) => {
		importSongs.value[idx] = !songInfo.value[idx].shouldImport;
	};

	const clickPattern = (tuneName: string, patternName: string) => {
		if(!importPatterns.value[tuneName])
			importPatterns.value[tuneName] = {};
		importPatterns.value[tuneName][patternName] = !tuneInfo.value[tuneName].patterns[patternName].shouldImport;
	};

	const clickTune = (tuneName: string) => {
		if(!parsed.value.state)
			return;

		if(!importPatterns.value[tuneName])
			importPatterns.value[tuneName] = { };

		const enable = tuneInfo.value[tuneName].shouldImport !== 2;
		importPatterns.value[tuneName] = Object.fromEntries(Object.keys(tuneInfo.value[tuneName].patterns).map((patternName) => [patternName, enable]));
	};

	const doImport = () => {
		if(parsed.value.state)
			extendState(state.value, parsed.value.state, (songIdx) => songInfo.value[songIdx].shouldImport, (tuneName, patternName) => tuneInfo.value[tuneName].patterns[patternName].shouldImport);

		modal.hide();
	};
</script>

<template>
	<Teleport to="body">
		<div class="modal fade bb-import-dialog" tabindex="-1" aria-hidden="true" ref="modalRef">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5">{{i18n.t("import-dialog.title")}}</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="i18n.t('general.dialog-close')"></button>
					</div>
					<div class="modal-body">
						<textarea
							class="form-control"
							:class="parsed.error ? 'is-invalid' : pasted.length > 0 ? 'is-valid' : undefined"
							v-model="pasted"
							:placeholder="i18n.t('import-dialog.paste-placeholder')"
						/>
						<div v-if="parsed.error" class="invalid-feedback">
							{{parsed.error}}
						</div>
						<div v-for="warning in parsed.warnings" :key="warning" class="alert alert-warning" role="alert">
							{{warning}}
						</div>

						<div v-if="parsed.state">
							<hr />
							<h3>{{i18n.t("import-dialog.customize-selection")}}</h3>
							<table class="table table-sm">
								<thead>
									<tr>
										<th>{{i18n.t("import-dialog.songs")}}</th>
										<th>{{i18n.t("import-dialog.tunes-breaks")}}</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>
											<ul class="list-group">
												<li v-for="(song, idx) in songInfo" :key="idx" class="list-group-item" :class="{active: song.shouldImport, disabled: song.exists}" v-tooltip.bottom="song.exists ? i18n.t('import-dialog.song-exists') : ''">
													<a v-if="!song.exists" href="javascript:" @click="clickSong(idx)" draggable="false">{{song.name}}</a>
													<span v-if="song.exists">{{song.name}} <fa icon="check"></fa></span>
												</li>
											</ul>
										</td>
										<td>
											<ul class="list-group">
												<li v-for="(tune, tuneName) in tuneInfo" :key="tuneName" class="list-group-item" :class="tune.className">
													<a href="javascript:" @click="clickTune(tuneName as string)" draggable="false">{{tune.displayName}}</a>
													<div>
														<span
															v-for="(pattern, patternName) in tune.patterns"
															:key="patternName"
															v-tooltip="pattern.exists == 2 ? i18n.t('import-dialog.break-exists-identical') : pattern.isUsed ? i18n.t('import-dialog.break-used') : pattern.exists ? i18n.t('import-dialog.break-exists-different') : ''"
														>
															<button
																type="button"
																class="btn btn-sm bb-inline-list-group-item"
																:disabled="!pattern.clickable"
																:class="[pattern.shouldImport ? 'btn-outline-dark' : 'btn-outline-secondary', { active: pattern.shouldImport }]"
																@click="pattern.clickable && clickPattern(tuneName as string, patternName as string)"
															>
																{{patternName}} <fa v-if="pattern.exists" :icon="pattern.exists == 2 ? 'check' : 'exclamation-circle'"></fa>
															</button>
														</span>
													</div>
												</li>
											</ul>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="modal.hide()">{{i18n.t("general.dialog-cancel")}}</button>
						<button type="button" class="btn btn-primary" @click="doImport()" :disabled="!parsed.state">{{i18n.t("import-dialog.import-button")}}</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.bb-import-dialog {
		thead th {
			width: 50%;
		}
	}
</style>