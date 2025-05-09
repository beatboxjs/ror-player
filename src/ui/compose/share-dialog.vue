<script setup lang="ts">
	import jsonFormat from 'json-format';
	import { compressState, getPatternFromState, getSongName, getSortedTuneList } from "../../state/state";
	import defaultTunes from "../../defaultTunes";
	import { Pattern, patternEquals } from "../../state/pattern";
	import { objectToString } from "../../utils";
	import { makeAbsoluteUrl } from "../../services/utils";
	import { PatternReference, songContainsPattern } from "../../state/song";
	import { injectStateRequired } from '../../services/state';
	import { computed, ref } from 'vue';
	import { useModal } from '../utils/modal';
	import vTooltip from "../utils/tooltip";
	import { getLocalizedDisplayName, useI18n } from '../../services/i18n';

	const props = defineProps<{
		linkPattern?: PatternReference;
		songIdx?: number;
	}>();

	const emit = defineEmits<{
		hidden: [];
	}>();

	const i18n = useI18n();

	const state = injectStateRequired();

	const shareSongs = ref<Record<number, boolean>>(!props.linkPattern && props.songIdx != null ? { [props.songIdx]: true } : {});
	const sharePatterns = ref<Record<string, Record<string, boolean>>>(props.linkPattern ? { [props.linkPattern[0]]: { [props.linkPattern[1]]: true } } : {});

	const modalRef = ref<HTMLElement>();
	useModal(modalRef, {
		onHidden: () => {
			emit("hidden");
		}
	});

	const tunes = computed(() => getSortedTuneList(state.value).flatMap((tuneName) => {
		const patterns = Object.keys(state.value.tunes[tuneName].patterns).filter((patternName) => {
			const originalPattern = defaultTunes.getPattern(tuneName, patternName);
			const pattern = getPatternFromState(state.value, tuneName, patternName) as Pattern;
			return !originalPattern || !patternEquals(pattern, originalPattern);
		}).map((patternName) => ({ patternName }));

		return patterns.length === 0 ? [] : [{
			tuneName,
			patterns
		}];
	}));

	const tuneInfo = computed(() => Object.fromEntries(tunes.value.map(({ tuneName, patterns }) => {
		const patternInfo = Object.fromEntries(patterns.map(({ patternName }) => {
			const isUsedInSong = state.value.songs.some((song, songIdx) => shareSongs.value[songIdx] && songContainsPattern(song, tuneName, patternName));
			const linked = props.linkPattern && props.linkPattern[0] === tuneName && props.linkPattern[1] === patternName;
			return [patternName, {
				/** 2: forced enable (used in song or linked); 1: user-enabled; 0: user-disabled */
				enabled: isUsedInSong || linked ? 2 : sharePatterns.value[tuneName] && sharePatterns.value[tuneName][patternName] ? 1 : 0
			}];
		}));

		const noneActive = Object.values(patternInfo).every(({ enabled }) => !enabled);
		const allActive = Object.values(patternInfo).every(({ enabled }) => !!enabled);

		return [tuneName, {
			patterns: patternInfo,
			enabled: noneActive ? 0 : allActive ? 2 : 1,
			className: noneActive ? "" : allActive ? "active" : "list-group-item-info"
		}];
	})));

	const getCompressedState = (encode: boolean) => {
		return compressState(state.value,
			(songIdx) => shareSongs.value[songIdx],
			(tuneName, patternName) => !!tuneInfo.value[tuneName]?.patterns[patternName]?.enabled,
			encode
		);
	};

	const rawStringUncompressed = computed(() => jsonFormat(getCompressedState(false)));

	const rawStringCompressed = computed(() => jsonFormat(getCompressedState(true)));

	const url = computed(() => {
		let res = `#/compose/${encodeURIComponent(objectToString(getCompressedState(true)))}`;

		if (props.linkPattern) {
			res += `/${encodeURIComponent(props.linkPattern[0])}/${encodeURIComponent(props.linkPattern[1])}`;
		} else {
			const enabledTunes = Object.keys(tuneInfo.value).filter((tuneName) => tuneInfo.value[tuneName].enabled);
			if (enabledTunes.length === 1) {
				res += `/${encodeURIComponent(enabledTunes[0])}/`;

				const enabledPatterns = Object.keys(tuneInfo.value[enabledTunes[0]].patterns).filter((patternName) => tuneInfo.value[enabledTunes[0]].patterns[patternName].enabled);
				if (enabledPatterns.length === 1) {
					res += encodeURIComponent(enabledPatterns[0]);
				}
			}
		}

		return makeAbsoluteUrl(res);
	});

	const toggleTune = (tuneName: string) => {
		const enable = tuneInfo.value[tuneName].enabled !== 2;
		sharePatterns.value[tuneName] = { };
		if(enable) {
			for(const i in state.value.tunes[tuneName].patterns) {
				sharePatterns.value[tuneName][i] = true;
			}
		}
	};

	const togglePattern = (tuneName: string, patternName: string) => {
		if(!sharePatterns.value[tuneName])
			sharePatterns.value[tuneName] = {};
		sharePatterns.value[tuneName][patternName] = !sharePatterns.value[tuneName][patternName];
	};

	const activeTab = ref(0);

</script>

<template>
	<Teleport to="body">
		<div class="modal fade bb-share-dialog" tabindex="-1" aria-hidden="true" ref="modalRef">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5">{{i18n.t("share-dialog.title")}}</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="i18n.t('general.dialog-close')"></button>
					</div>
					<div class="modal-body">
						<ul class="nav nav-tabs">
							<li class="nav-item"><a class="nav-link" :class="{ active: activeTab === 0 }" href="javascript:" @click="activeTab = 0">{{i18n.t("share-dialog.link")}}</a></li>
							<li class="nav-item"><a class="nav-link" :class="{ active: activeTab === 1 }" href="javascript:" @click="activeTab = 1">{{i18n.t("share-dialog.raw-compressed")}}</a></li>
							<li class="nav-item"><a class="nav-link" :class="{ active: activeTab === 2 }" href="javascript:" @click="activeTab = 2">{{i18n.t("share-dialog.raw-uncompressed")}}</a></li>
						</ul>

						<div v-if="activeTab === 0">
							<textarea readonly class="form-control" rows="5" :value="url"></textarea>
							<p><em>{{i18n.t("share-dialog.link-description")}}</em></p>
						</div>
						<div v-else-if="activeTab === 1">
							<textarea readonly class="form-control" rows="10" :value="rawStringCompressed"></textarea>
							<p><em>{{i18n.t("share-dialog.raw-description")}}</em></p>
						</div>
						<div v-else-if="activeTab === 2">
							<textarea readonly class="form-control" rows="10" :value="rawStringUncompressed"></textarea>
							<p><em>{{i18n.t("share-dialog.raw-description")}}</em></p>
						</div>

						<hr />

						<h3>{{i18n.t("share-dialog.customize-heading")}}</h3>
						<table class="table table-sm">
							<thead>
								<tr>
									<th>{{i18n.t("share-dialog.customize-songs")}}</th>
									<th>{{i18n.t("share-dialog.customize-tunes-breaks")}}</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<div class="list-group">
											<a
												v-for="(song, idx) in state.songs"
												:key="idx"
												class="list-group-item list-group-item-action"
												:class="{ active: shareSongs[idx] }"
												href="javascript:"
												@click="shareSongs[idx] = !shareSongs[idx]"
												draggable="false"
											>{{getSongName(state, idx)}}</a>
										</div>
									</td>
									<td>
										<ul class="list-group">
											<li
												v-for="({ patterns, className }, tuneName) in tuneInfo"
												:key="tuneName"
												class="list-group-item"
												:class="className"
											>
												<a href="javascript:" @click="toggleTune(tuneName as string)" draggable="false">{{getLocalizedDisplayName(state.tunes[tuneName].displayName || tuneName as string)}}</a>
												<span
													v-for="({ enabled }, patternName) in patterns"
													:key="patternName"
													v-tooltip.bottom="props.linkPattern && props.linkPattern[0] == tuneName && props.linkPattern[1] == patternName ? i18n.t('share-dialog.customize-tooltip-default') : enabled === 2 ? i18n.t('share-dialog.customize-tooltip-used') : ''"
												>
													<button
														type="button"
														class="btn btn-sm bb-inline-list-group-item"
														:class="[enabled ? 'btn-outline-dark' : 'btn-outline-secondary', { active: enabled }]"
														:disabled="enabled === 2"
														@click="togglePattern(tuneName as string, patternName as string)"
													>
														{{getLocalizedDisplayName(state.tunes[tuneName].patterns[patternName].displayName || patternName as string)}} <fa icon="star" v-if="linkPattern && linkPattern[0] == tuneName && linkPattern[1] == patternName" />
													</button>
												</span>
											</li>
										</ul>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.bb-share-dialog {
		thead th {
			width: 50%;
		}
	}
</style>