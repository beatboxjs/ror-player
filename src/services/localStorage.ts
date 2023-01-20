import { reactive, watch } from 'vue';

export const reactiveLocalStorage = reactive<Record<string, string>>({});

function copyStorage(from: Record<string, string>, to: Record<string, string>) {
	try {
		const toKeys = Object.keys(to);
		const fromKeys = Object.keys(from);
		for (const key of toKeys) {
			if (!fromKeys.includes(key)) {
				delete to[key];
			}
		}

		for (const key of fromKeys) {
			if (!toKeys.includes(key) || to[key] !== from[key]) {
				to[key] = from[key];
			}
		}
	} catch (e: any) {
		// eslint-disable-next-line no-console
		console.error(e.stack || e);
	}
}

copyStorage(localStorage, reactiveLocalStorage);

window.addEventListener("storage", () => {
	copyStorage(localStorage, reactiveLocalStorage);
});

watch(reactiveLocalStorage, () => {
	copyStorage(reactiveLocalStorage, localStorage);
}, { deep: true });

export function ensurePersistentStorage(): void {
	navigator.storage?.persist?.();
}
