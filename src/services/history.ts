import { CompressedPattern, compressPattern } from "../state/pattern";
import { CompressedSongs, compressSongs } from "../state/song";
import { CompressedState, compressSongsAndTunes, createSong, extendState, extendStateFromCompressed, normalizeState } from "../state/state";
import { computedProperties, objectToString, stringToObject } from "../utils";
import { isEqual } from "lodash-es";
import { computed, Ref, effectScope, ref, toRaw, watch } from "vue";
import defaultTunes from "../defaultTunes";

const storageKeyPrefix = "bbState-";

export class History {

	_storage!: Record<string, string>;
	_storageDecoded!: Readonly<Record<string, object | undefined>>;
	state = ref(normalizeState());
	_compressedSongs!: Ref<CompressedSongs>;
	_compressedTunes!: Record<string, Record<string, CompressedPattern>>;
	_compressedState = ref<object>();
	currentKey = ref<number>();
	_scope = effectScope();

	constructor(storage: Record<string, string>) {
		this._scope.run(() => {
			this._storage = storage;
			this._storageDecoded = computedProperties(storage, (v, k) => {
				if (k.startsWith(storageKeyPrefix)) {
					return stringToObject(v);
				}
			});

			this._compressedSongs = computed(() => {
				return compressSongs(this.state.value.songs, true);
			});

			this._compressedTunes = computedProperties(() => this.state.value.tunes, (tune, tuneName) => {
				return computedProperties(() => tune.patterns, (pattern, patternName) => {
					const originalPattern = defaultTunes.getPattern(tuneName, patternName);
					return compressPattern(pattern, originalPattern, true);
				});
			});

			this._compressedState = computed(() => compressSongsAndTunes(
				this.state.value,
				this._compressedSongs.value,
				this._compressedTunes,
				true,
				true
			));

			watch(() => Number(this._storage.bbState) && this._storage[`bbState-${this._storage.bbState}`], () => {
				this.loadHistoricState(Number(this._storage.bbState));
			}, { deep: true, immediate: true });

			watch(this._compressedState, () => {
				this.saveCurrentState();
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
		const errs = this._loadFromCompressed(encodedString ? stringToObject(encodedString) : {});

		this.currentKey.value = undefined;

		return errs;
	}

	getCurrentKey(): number | undefined {
		return this.currentKey.value;
	}

	getHistoricStates(): number[] {
		return Object.keys(this._storage)
			.flatMap((k) => (k.startsWith(storageKeyPrefix) ? [parseInt(k.slice(storageKeyPrefix.length), 10)]: []))
			.sort().reverse();
	}

	loadHistoricState(key: number): void {
		this.currentKey.value = key;
		this._storage.bbState = `${key}`;
		this._loadFromCompressed(this._storageDecoded[`bbState-${key}`] ?? {});
	}

	clear(): void {
		this._ensureMaxNumber(1);
	}

	_loadFromCompressed(compressed: CompressedState): string[] {
		try {
			if (isEqual(toRaw(compressed), toRaw(this._compressedState.value))) {
				return [];
			}

			const state = normalizeState();
			const errors = extendStateFromCompressed(state, compressed, null, null, true, true, true);
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
		const obj = toRaw(this._compressedState.value!);
		if(Object.keys(obj).length == 0 || (this.currentKey.value && this._storageDecoded[`bbState-${this.currentKey.value}`] && isEqual(obj, toRaw(this._storageDecoded[`bbState-${this.currentKey.value}`]) || {})))
			return;

		const newKey = this._getNowKey();
		if(this.currentKey.value && newKey - this.currentKey.value < 3600)
			delete this._storage[`bbState-${this.currentKey.value}`];

		const sameState = this._findSameState(obj);
		if(sameState) {
			this._storage.bbState = `${sameState}`;
			this.currentKey.value = sameState;
			return;
		}

		this._storage[`bbState-${newKey}`] = objectToString(obj);
		this._storage.bbState = `${newKey}`;
		this.currentKey.value = newKey;

		this._ensureMaxNumber();
	}

	_ensureMaxNumber(number: number = 30): void {
		for (const key of this.getHistoricStates().slice(number)) {
			if(key != this.currentKey.value)
				delete this._storage[`bbState-${key}`];
		}
	}

	_findSameState(obj: object): number | undefined {
		const rawObj = toRaw(obj); // Clear it of observable stuff, otherwise isEqual will always be false

		const keys = this.getHistoricStates();
		for(let i=0; i<keys.length; i++) {
			if(isEqual(rawObj, toRaw(this._storageDecoded[`bbState-${keys[i]}`]) || {}))
				return keys[i];
		}
	}
}
