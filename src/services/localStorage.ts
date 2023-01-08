import { reactive } from 'vue';

interface LocalStorageOperation {
	<T>(callback: () => T, fallbackValue: T): T,
	(callback: () => void): void
}

const localStorageOperation: LocalStorageOperation = <T>(callback: () => T, fallbackValue?: T): T | void => {
	try {
		return callback();
	} catch (e: any) {
		// eslint-disable-next-line no-console
		console.error(e.stack || e);
		return fallbackValue;
	}
};

const data: {
	keys: string[];
	store: {
		[key: string]: string | null;
	};
} = reactive({ keys: [ ], store: { } });

function updateStore() {
	localStorageOperation(() => {
		data.keys.splice(0, data.keys.length);
		data.keys.push(...Object.keys(localStorage));

		for(const key of Object.keys(data.store)) {
			data.store[key] = localStorage.getItem(key)!;
		}
	});
}

updateStore();
window.addEventListener("storage", updateStore);

export function getLocalStorageItem(key: string): string | null {
	if(!(key in data.store)) {
		data.store[key] = localStorageOperation(() => localStorage.getItem(key), null);
	}

	return data.store[key];
}

export function getLocalStorageNumberItem(key: string): number | null {
	const val = getLocalStorageItem(key);
	return val == null ? null : parseInt(val, 10);
}

export function getLocalStorageKeys(): string[] {
	return [ ...data.keys ];
}

export function setLocalStorageItem(key: string, value: string | number): void {
	localStorageOperation(() => {
		localStorage.setItem(key, `${value}`);
		data.store[key] = `${value}`;
	});
	updateStore();
}

export function setLocalStorageItems(items: { [key: string]: string | number }): void {
	localStorageOperation(() => {
		for (const key in items) {
			localStorage.setItem(key, `${items[key]}`);
			data.store[key] = `${items[key]}`;
		}
	});
	updateStore();
}

export function removeLocalStorageItem(key: string): void {
	localStorageOperation(() => {
		localStorage.removeItem(key);
		delete data.store[key];
	});
	updateStore();
}

export function ensurePersistentStorage(): void {
	navigator.storage?.persist?.();
}
