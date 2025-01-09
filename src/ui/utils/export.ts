import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Beatbox from 'beatbox.js';
import { exportMP3, exportWAV } from 'beatbox.js-export';
import FileSaver from 'file-saver';
import { createApp, defineComponent, h, ref } from 'vue';
import { showAlert } from './alert';
import Progress from "./progress.vue";
import { getI18n } from '../../services/i18n';

export enum ExportType { WAV = "wav", MP3 = "mp3" };

export type ExportArgs = { type: ExportType; player: Beatbox; filename: string };

export async function download({ type, player, filename }: ExportArgs): Promise<void> {
	const progress = ref(0);
	const abort = new AbortController();

	const progressEl = document.createElement('div');
	document.body.appendChild(progressEl);
	const progressApp = createApp(defineComponent({
		setup: () => () => h(Progress, {
			progress: progress.value,
			onCancel: () => {
				abort.abort();
			}
		})
	})).component('fa', FontAwesomeIcon);
	progressApp.mount(progressEl);

	try {
		const exportFunc = type === ExportType.MP3 ? exportMP3 : exportWAV;
		const blob = await exportFunc(player, {
			onProgress: (perc) => {
				progress.value = perc*100;
			},
			signal: abort.signal
		});

		FileSaver.saveAs(blob, `${filename}.${type}`);
	} catch(err: any) {
		if (err instanceof DOMException && err.name === "AbortError") {
			return;
		}

		// eslint-disable-next-line no-console
		console.error(`Error exporting ${type.toUpperCase()}`, err.stack || err);
		showAlert({ title: () => getI18n().t("export.error-title", { type: type.toUpperCase() }), message: err.message, variant: "danger" });
	} finally {
		progressApp.unmount();
		progressEl.remove();
	}
};