<script setup lang="ts">
	import { BeatboxReference, stopAllPlayers } from "../../services/player";
	import { getPatternFromState } from "../../state/state";
	import defaultTunes from "../../defaultTunes";
	import { patternEquals } from "../../state/pattern";
	import PatternPlayer from "./pattern-player.vue";
	import ShareDialog from "../compose/share-dialog.vue";
	import { computed, ref } from "vue";
	import { injectStateRequired } from "../../services/state";
	import { useModal } from "./../utils/modal";

	const state = injectStateRequired();

	const props = withDefaults(defineProps<{
		show?: boolean;
		tuneName: string;
		patternName: string;
		readonly?: boolean;
		playerRef?: BeatboxReference;
	}>(), {
		readonly: false
	});

	const emit = defineEmits<{
		(type: 'update:show', show: boolean): void;
	}>();

	const modal = useModal({
		show: computed(() => !!props.show),
		emit,
		onHide: () => {
			stopAllPlayers();
		}
	});

	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName)!);

	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const title = computed(() => `${state.value.tunes[props.tuneName].displayName || props.tuneName} – ${state.value.tunes[props.tuneName].patterns[props.patternName].displayName || props.patternName}`);

	const hasChanged = computed(() => !originalPattern.value || !patternEquals(originalPattern.value, pattern.value));

	const showShareDialog = ref(false);

	const share = () => {
		showShareDialog.value = true;
	};
</script>

<template>
	<Teleport to="body">
		<div class="modal fade bb-pattern-editor-dialog" tabindex="-1" aria-hidden="true" :ref="modal.ref">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5">{{title}}</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<PatternPlayer :tuneName="tuneName" :patternName="patternName" :readonly="readonly" :player="playerRef">
							<button type="button" class="btn btn-info" v-if="hasChanged" @click="share()"><fa icon="share"/> Share</button>
						</PatternPlayer>
						<ShareDialog v-if="showShareDialog" v-model:show="showShareDialog" :link-pattern="[tuneName, patternName]" />
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.bb-pattern-editor-dialog {
		display: flex !important;
		justify-content: center;
		align-items: center;

		.modal-dialog {
			margin: 30px;
			width: auto;
			max-width: calc(100% - 60px);
			display: inline-block;
		}
	}
</style>