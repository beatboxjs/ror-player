import { compressState, extendState, extendStateFromCompressed, normalizeState, State } from "../state/state";
import { clone, objectToString, stringToObject } from "../utils";
import { isEqual } from "lodash";
import events, { registerMultipleHandlers } from "./events";
import Component from "vue-class-component";
import Vue from "vue";
import { ProvideReactive, Watch } from "vue-property-decorator";

interface LocalStorageOperation {
	<T>(callback: () => T, fallbackValue: T): T,
	(callback: () => void): void
}

const localStorageOperation: LocalStorageOperation = <T>(callback: () => T, fallbackValue?: T): T | void => {
	try {
		return callback();
	} catch (e) {
		console.error(e.stack || e);
		return fallbackValue;
	}
};

function getLocalStorageItem(key: string): string | null {
	return localStorageOperation(() => localStorage.getItem(key), null);
}

function getLocalStorageNumberItem(key: string): number | null {
	const val = getLocalStorageItem(key);
	return val == null ? null : parseInt(val, 10);
}

class History {

	state: State = normalizeState();

	_currentKey: number | null = null;

	loadEncodedString(encodedString: string) {
		this.saveCurrentState();
		const errs = this._loadFromString(encodedString);

		this._currentKey = null;

		this.saveCurrentState(true);

		events.$emit("history-load-encoded-string");

		return errs;
	}

	getCurrentKey() {
		return this._currentKey;
	}

	getHistoricStates(): number[] {
		return localStorageOperation(() => Object.keys(localStorage), [])
			.map((key) => key.match(/^bbState-(.*)$/))
			.filter((m) => m)
			.map((m) => parseInt((m as RegExpMatchArray)[1], 10))
			.sort().reverse();
	}

	loadHistoricState(key?: number | null): void {
		if(key == null)
			key = getLocalStorageNumberItem("bbState");

		if(this._currentKey)
			this.saveCurrentState();

		this._loadFromString(key && getLocalStorageItem("bbState-"+key) || "");
		this._currentKey = key;
		this.saveCurrentState();
	}

	clear(): void {
		this._ensureMaxNumber(1);
	}

	_loadFromString(encodedString: string | null): string[] {
		try {
			const state = normalizeState();
			const errors = extendStateFromCompressed(state, encodedString ? stringToObject(encodedString) : { }, null, null, true, true, true);
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

	saveCurrentState(findSameState: boolean = false): void {
		const obj = compressState(this.state, null, null, true, true, true);
		if(Object.keys(obj).length == 0 || (this._currentKey && getLocalStorageItem("bbState-"+this._currentKey) && isEqual(obj, stringToObject(getLocalStorageItem("bbState-"+this._currentKey) || ""))))
			return;

		const newKey = this._getNowKey();
		if(this._currentKey && newKey - this._currentKey < 3600)
			localStorageOperation(() => localStorage.removeItem("bbState-" + this._currentKey));

		if(findSameState) {
			const sameState = this._findSameState(obj);
			if(sameState) {
				localStorageOperation(() => localStorage.setItem("bbState", `${sameState}`));
				this._currentKey = sameState;
				return;
			}
		}

		localStorageOperation(() => {
			localStorage.setItem("bbState-"+newKey, objectToString(obj));
			localStorage.setItem("bbState", `${newKey}`);
		});
		this._currentKey = newKey;

		this._ensureMaxNumber();
	}

	_ensureMaxNumber(number: number = 30): void {
		for (const key of this.getHistoricStates().slice(number)) {
			if(key != this._currentKey)
				localStorageOperation(() => localStorage.removeItem("bbState-"+key));
		}
	}

	_findSameState(obj: object): number | null {
		const keys = this.getHistoricStates();
		for(let i=0; i<keys.length; i++) {
			if(isEqual(obj, stringToObject(getLocalStorageItem("bbState-"+keys[i]) || "")))
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