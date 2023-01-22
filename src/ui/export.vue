<script setup lang="ts">
	import { exportMP3, exportWAV } from 'beatbox.js-export';
	import FileSaver from 'file-saver';
	import { ref } from 'vue';
	import { BeatboxReference, getPlayerById } from '../services/player';
	import { showAlert } from './utils/alert';
	import Progress from "./utils/progress.vue";

	const props = defineProps<{
		player: BeatboxReference | (() => BeatboxReference);
		filename: string;
	}>();

	const exportProgress = ref<number>();
	const exportCanceled = ref(false);

	const download = async (extension: string, exportFunc: typeof exportMP3) => {
		try {
			exportProgress.value = 0;
			exportCanceled.value = false;
			const player = getPlayerById((typeof props.player === 'function' ? props.player() : props.player).id);
			const blob = await exportFunc(player, (perc) => {
				if(exportCanceled.value)
					return false;
				else
					exportProgress.value = Math.round(perc*100);
			});

			exportProgress.value = undefined;

			if (blob)
				FileSaver.saveAs(blob, `${props.filename}.${extension}`);
		} catch(err: any) {
			exportProgress.value = undefined;
			// eslint-disable-next-line no-console
			console.error(`Error exporting ${extension.toUpperCase()}`, err.stack || err);
			showAlert({ title: `Error exporting ${extension.toUpperCase()}`, message: err.message, variant: "danger" });
		}
	}

	const downloadMP3 = async () => {
		await download('mp3', exportMP3);
	}

	const downloadWAV = async () => {
		await download('wav', exportWAV);
	};

	const cancelExport = () => {
		exportCanceled.value = true;
	};
</script>

<template>
	<Progress :progress="exportProgress" @cancel="cancelExport()"/>
	<slot :downloadMP3="downloadMP3" :downloadWAV="downloadWAV" />
</template>