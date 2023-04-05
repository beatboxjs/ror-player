import "./import-dialog.scss";
import WithRender from "./import-dialog.vue";
import Component from "vue-class-component";
import Vue from "vue";
import {
	extendState,
	extendStateFromCompressed,
	getPatternFromState,
	normalizeState,
	songExists,
	State
} from "../../state/state";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";
import { stringToObject } from "../../utils";
import { patternEquals } from "../../state/pattern";
import { songContainsPattern } from "../../state/song";


@WithRender
@Component({})
export default class ImportDialog extends Vue {

	@InjectReactive() readonly state!: State;
	@Prop({ type: String, required: true }) readonly id!: string;

	importSongs: { [songIdx: number]: boolean } = { };
	importPatterns: { [tuneName: string] : { [patternName: string]: boolean } } = { };

	obj: State | null = null;
	error: string | null = null;
	warnings: Array<string> = [ ];
	pasted: string = "";

	@Watch("pasted")
	onPastedChange(pasted: string) {
		this.obj = null;
		this.error = null;
		this.warnings = [ ];

		if(!pasted)
			return;

		pasted = pasted.trim();

		try {
			let m;
			if(pasted.charAt(0) == "{" || (m = pasted.match(/#(\/compose)?\/([-_a-zA-Z0-9]+)/))) {
				const state = normalizeState({ tunes: { } });
				this.warnings = extendStateFromCompressed(state, m ? stringToObject(m[2]) : JSON.parse(pasted), null, null, false, false, true);
				this.obj = state;
			}
			else
				this.error = "Unrecognised format.";
		} catch(e) {
			console.error((e as Error).stack || e);
			this.error = "Error decoding pasted data: " + ((e as Error).message || e);
		}
	}

	clickSong(idx: number) {
		Vue.set(this.importSongs, idx, !this.shouldImportSong(idx));
	}

	clickPattern(tuneName: string, patternName: string) {
		if(!this.importPatterns[tuneName])
			Vue.set(this.importPatterns, tuneName, {});
		Vue.set(this.importPatterns[tuneName], patternName, !this.shouldImportPattern(tuneName, patternName));
	}

	clickTune(tuneName: string) {
		if(!this.obj)
			return;

		if(!this.importPatterns[tuneName])
			Vue.set(this.importPatterns, tuneName, { });

		let enable = false;
		for(const patternName in this.obj.tunes[tuneName].patterns) {
			if(!this.shouldImportPattern(tuneName, patternName)) {
				enable = true;
				break;
			}
		}

		for(const patternName in this.obj.tunes[tuneName].patterns) {
			Vue.set(this.importPatterns[tuneName], patternName, enable);
		}
	};

	patternExists(tuneName: string, patternName: string) {
		const pattern = getPatternFromState(this.state, tuneName, patternName);
		if(!pattern)
			return 0;

		const pattern2 = this.obj && getPatternFromState(this.obj, tuneName, patternName);
		return pattern2 && patternEquals(pattern, pattern2) ? 2 : 1;
	};

	patternIsUsed(tuneName: string, patternName: string) {
		if(!this.obj)
			return false;

		for(let i=0; i<this.obj.songs.length; i++) {
			if(this.shouldImportSong(i) && songContainsPattern(this.obj.songs[i], tuneName, patternName))
				return true;
		}

		return false;
	};

	shouldImportSong(songIdx: number) {
		if(!this.obj)
			return false;

		if(songExists(this.state, this.obj.songs[songIdx]))
			return false;
		else if(this.importSongs[songIdx] != null)
			return this.importSongs[songIdx];
		else
			return true;
	};

	shouldImportPattern(tuneName: string, patternName: string) {
		const exists = this.patternExists(tuneName, patternName);
		if(exists == 2)
			return false;
		else if(!exists && this.patternIsUsed(tuneName, patternName))
			return true;
		else if(this.importPatterns[tuneName] && this.importPatterns[tuneName][patternName] != null)
			return this.importPatterns[tuneName][patternName];
		else
			return exists != 1;
	};

	getTuneClass(tuneName: string) {
		if(!this.obj)
			return "";

		let imported = 0;
		for(const patternName in this.obj.tunes[tuneName].patterns) {
			if(this.shouldImportPattern(tuneName, patternName))
				imported++;
		}

		if(imported == 0)
			return "";
		else if(imported == Object.keys(this.obj.tunes[tuneName].patterns).length)
			return "active";
		else
			return "list-group-item-primary";
	};

	doImport() {
		if(this.obj)
			extendState(this.state, this.obj, this.shouldImportSong.bind(this), this.shouldImportPattern.bind(this));

		this.$bvModal.hide(this.id);
	};

	get songs() {
		if(!this.obj)
			return [];

		return Object.keys(this.obj.songs).map((songIdx) => {
			const song = (this.obj as State).songs[songIdx as any];
			return {
				shouldImport: this.shouldImportSong(songIdx as any),
				exists: songExists(this.state, song),
				name: song.name || 'Untitled song'
			};
		});
	}

	get tunes() {
		if(!this.obj)
			return [];

		return Object.keys(this.obj.tunes).map((tuneName) => {
			const orig = this.state.tunes[tuneName];
			return {
				tuneName,
				displayName: (orig && orig.displayName) || tuneName,
				className: this.getTuneClass(tuneName),
				patterns: Object.keys((this.obj as State).tunes[tuneName].patterns).map((patternName) => {
					const isUsed = this.patternIsUsed(tuneName, patternName);
					const exists = this.patternExists(tuneName, patternName);
					return {
						shouldImport: this.shouldImportPattern(tuneName, patternName),
						isUsed,
						exists,
						patternName,
						clickable: (!isUsed || exists) && exists != 2
					};
				})
			}
		});
	}

}