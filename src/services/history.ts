import { compressState, createSong, extendState, extendStateFromCompressed, normalizeState } from "../state/state";
import { objectToString, stringToObject } from "../utils";
import { isEqual } from "lodash-es";
import { effectScope, nextTick, ref, toRaw, watch } from "vue";

const storageKeyPrefix = "bbState-";

export class History {

	storage: Record<string, string>;
	_stringToObjectCache: Record<string, object> = {};
	state = ref(normalizeState());
	_stateCompressed = ref<object>();
	currentKey = ref<number>();
	_scope = effectScope();

	constructor(storage: Record<string, string>) {
		this.storage = storage;

		this._scope.run(() => {
			watch(this.state, () => {
				this._stateCompressed.value = compressState(this.state.value, null, null, true, true, true);
			}, { deep: true, immediate: true });

			watch(storage, () => {
				this.loadHistoricState();

				const storageValues = Object.values(this.storage);
				for (const k of Object.keys(this._stringToObjectCache)) {
					if (!storageValues.includes(k)) {
						delete this._stringToObjectCache[k];
					}
				}
			}, { deep: true, immediate: true });

			watch(this.state, () => {
				nextTick(() => {
					this.saveCurrentState();
				});
			}, { deep: true, immediate: true });
		});

		// Legacy storage
		if(storage.song) {
			extendState(this.state.value, { songs: [ JSON.parse(storage.song) ] });
			delete storage.song;
		}
		if(storage.myTunes) {
			extendState(this.state.value, {
				tunes: {
					"My tunes": JSON.parse(storage.myTunes)
				}
			});
			delete storage.myTunes;
		}
	}

	destroy(): void {
		this._scope.stop();
	}

	loadEncodedString(encodedString: string): string[] {
		const errs = this._loadFromString(encodedString);

		this.currentKey.value = undefined;

		return errs;
	}

	getCurrentKey(): number | undefined {
		return this.currentKey.value;
	}

	getHistoricStates(): number[] {
		return Object.keys(this.storage)
			.flatMap((k) => (k.startsWith(storageKeyPrefix) ? [parseInt(k.slice(storageKeyPrefix.length), 10)]: []))
			.sort().reverse();
	}

	loadHistoricState(key?: number | null): void {
		if(key == null)
			key = Number(this.storage.bbState);

		this._loadFromString(key && this.storage[`bbState-${key}`] || "");
		this.currentKey.value = key;
	}

	clear(): void {
		this._ensureMaxNumber(1);
	}

	_cachedStringToObject(str: string): object {
		return this._stringToObjectCache[str] = this._stringToObjectCache[str] ?? stringToObject(str);
	}

	_loadFromString(encodedString: string | null): string[] {
		try {
			const obj = encodedString ? this._cachedStringToObject(encodedString) : {};
			if (isEqual(obj, this._stateCompressed.value)) {
				return [];
			}

			const state = normalizeState();
			const errors = extendStateFromCompressed(state, obj, null, null, true, true, true);
			if(state.songs.length == 0) {
				createSong(state);
			}
			this.state.value = state;
			return errors;
		} catch(e: any) {
			// eslint-disable-next-line no-console
			console.error("Error decoding state", e.stack || e);
			return [e.message || e];
		}
	}

	_getNowKey(): number {
		return Math.floor(new Date().getTime() / 1000);
	}

	saveCurrentState(): void {
		const obj = compressState(this.state.value, null, null, true, true, true);
		if(Object.keys(obj).length == 0 || (this.currentKey.value && this.storage[`bbState-${this.currentKey.value}`] && isEqual(obj, this._cachedStringToObject(this.storage[`bbState-${this.currentKey.value}`] || ""))))
			return;

		const newKey = this._getNowKey();
		if(this.currentKey.value && newKey - this.currentKey.value < 3600)
			delete this.storage[`bbState-${this.currentKey.value}`];

		const sameState = this._findSameState(obj);
		if(sameState) {
			this.storage.bbState = `${sameState}`;
			this.currentKey.value = sameState;
			return;
		}

		this.storage[`bbState-${newKey}`] = objectToString(obj);
		this.storage.bbState = `${newKey}`;
		this.currentKey.value = newKey;

		this._ensureMaxNumber();
	}

	_ensureMaxNumber(number: number = 30): void {
		for (const key of this.getHistoricStates().slice(number)) {
			if(key != this.currentKey.value)
				delete this.storage[`bbState-${key}`];
		}
	}

	_findSameState(obj: object): number | undefined {
		const rawObj = toRaw(obj); // Clear it of observable stuff, otherwise isEqual will always be false

		const keys = this.getHistoricStates();
		for(let i=0; i<keys.length; i++) {
			if(isEqual(rawObj, stringToObject(this.storage[`bbState-${keys[i]}`] || "")))
				return keys[i];
		}
	}
}
