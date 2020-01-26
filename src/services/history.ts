import {
	compressState,
	createSong,
	extendState,
	extendStateFromCompressed,
	normalizeState,
	State
} from "../state/state";
import { clone, objectToString, stringToObject } from "../utils";
import { isEqual } from "lodash";
import events, { registerMultipleHandlers } from "./events";
import Component from "vue-class-component";
import Vue from "vue";
import { ProvideReactive, Watch } from "vue-property-decorator";
import {
	getLocalStorageItem,
	getLocalStorageKeys,
	getLocalStorageNumberItem,
	removeLocalStorageItem, setLocalStorageItem, setLocalStorageItems
} from "./localStorage";

class History {

	state: State = normalizeState();

	_data: {
		currentKey: number | null
	} = Vue.observable({
		currentKey: null
	});

	loadEncodedString(encodedString: string) {
		this.saveCurrentState();
		const errs = this._loadFromString(encodedString);

		this._data.currentKey = null;

		this.saveCurrentState();

		events.$emit("history-load-encoded-string");

		return errs;
	}

	getCurrentKey() {
		return this._data.currentKey;
	}

	getHistoricStates(): number[] {
		return getLocalStorageKeys()
			.map((key) => key.match(/^bbState-(.*)$/))
			.filter((m) => m)
			.map((m) => parseInt((m as RegExpMatchArray)[1], 10))
			.sort().reverse();
	}

	loadHistoricState(key?: number | null): void {
		if(key == null)
			key = getLocalStorageNumberItem("bbState");

		if(this._data.currentKey)
			this.saveCurrentState();

		this._loadFromString(key && getLocalStorageItem("bbState-"+key) || "");
		this._data.currentKey = key;
		this.saveCurrentState();
	}

	clear(): void {
		this._ensureMaxNumber(1);
	}

	_loadFromString(encodedString: string | null): string[] {
		try {
			const state = normalizeState();
			const errors = extendStateFromCompressed(state, encodedString ? stringToObject(encodedString) : { }, null, null, true, true, true);
			if(state.songs.length == 0) {
				createSong(state);
			}
			this.state = state;
			events.$emit("new-state", state);
			return errors;
		} catch(e) {
			console.error("Error decoding state", e.stack || e);
			return [e.message || e];
		}
	}

	_getNowKey(): number {
		return Math.floor(new Date().getTime() / 1000);
	}

	saveCurrentState(): void {
		const obj = compressState(this.state, null, null, true, true, true);
		if(Object.keys(obj).length == 0 || (this._data.currentKey && getLocalStorageItem("bbState-"+this._data.currentKey) && isEqual(obj, stringToObject(getLocalStorageItem("bbState-"+this._data.currentKey) || ""))))
			return;

		const newKey = this._getNowKey();
		if(this._data.currentKey && newKey - this._data.currentKey < 3600)
			removeLocalStorageItem("bbState-" + this._data.currentKey);

		const sameState = this._findSameState(obj);
		if(sameState) {
			setLocalStorageItem("bbState", `${sameState}`);
			this._data.currentKey = sameState;
			return;
		}

		setLocalStorageItems({
			["bbState-"+newKey]: objectToString(obj),
			"bbState": newKey
		});
		this._data.currentKey = newKey;

		this._ensureMaxNumber();
	}

	_ensureMaxNumber(number: number = 30): void {
		for (const key of this.getHistoricStates().slice(number)) {
			if(key != this._data.currentKey)
				removeLocalStorageItem("bbState-"+key);
		}
	}

	_findSameState(obj: object): number | null {
		const objCleared = clone(obj); // Clear it of observable stuff, otherwise isEqual will always be false

		const keys = this.getHistoricStates();
		for(let i=0; i<keys.length; i++) {
			if(isEqual(objCleared, stringToObject(getLocalStorageItem("bbState-"+keys[i]) || "")))
				return keys[i];
		}
		return null;
	}
}


const history = new History();

history.loadHistoricState();

// Legacy storage

const legacySong = getLocalStorageItem("song");
if(legacySong) {
	extendState(history.state, { songs: [ JSON.parse(legacySong) ] });
	delete localStorage.song;

	history.saveCurrentState();
}

const legacyTunes = getLocalStorageItem("myTunes");
if(legacyTunes) {
	extendState(history.state, {
		tunes: {
			"My tunes": JSON.parse(legacyTunes)
		}
	});
	delete localStorage.myTunes;

	history.saveCurrentState();
}

export default history;

@Component({
	template: `<div class="bb-state-provider"><slot/></div>`
})
export class StateProvider extends Vue {

	@ProvideReactive() state = history.state;

	_unregisterHandlers!: () => void;

	@Watch("state", { deep: true })
	handleStateChange() {
		history.saveCurrentState();
	}

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"new-state"(state) {
				this.state = state;
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

}