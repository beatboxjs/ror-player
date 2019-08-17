import jsonFormat from 'json-format';
import Vue from "vue";
import Component from "vue-class-component";
import template from "./share-dialog.vue";
import "./share-dialog.scss";
import {
	compressState,
	getPatternFromState,
	getSongName,
	getSortedTuneList,
	PatternReference,
	State
} from "../../state/state";
import { InjectReactive, Prop } from "vue-property-decorator";
import defaultTunes from "../../defaultTunes";
import { Pattern, patternEquals } from "../../state/pattern";
import { objectToString } from "../../utils";
import { makeAbsoluteUrl } from "../../services/utils";
import { songContainsPattern } from "../../state/song";

@Component({
	template,
	components: { }
})
export default class ShareDialog extends Vue {

	@InjectReactive() readonly state!: State;

	@Prop(String) readonly id?: string;
	@Prop(Array) readonly linkPattern?: PatternReference;

	shareSongs: { [songIdx: number]: boolean } = { };
	sharePatterns: { [tuneName: string]: { [patternName: string]: boolean } } = { };

	created() {
		if(!this.linkPattern)
			this.shareSongs[this.state.songIdx] = true;
		else {
			this.sharePatterns[this.linkPattern[0]] = {};
			this.sharePatterns[this.linkPattern[0]][this.linkPattern[1]] = true;
		}
	}

	getModifiedPatternNames(tuneName: string) {
		const ret = [ ];
		for(const patternName in this.state.tunes[tuneName].patterns) {
			const originalPattern = defaultTunes.getPattern(tuneName, patternName);
			const pattern = getPatternFromState(this.state, tuneName, patternName) as Pattern;
			if(!originalPattern || !patternEquals(pattern, originalPattern))
				ret.push(patternName);
		}
		return ret;
	}

	_getCompressedState(encode: boolean) {
		return compressState(this.state,
			(songIdx) => this.shareSongs[songIdx],
			(tuneName, patternName) => !!this.shouldExportPattern(tuneName, patternName),
			encode
		);
	}

	get sortedTuneList() {
		return getSortedTuneList(this.state);
	}

	get rawStringUncompressed() {
		return JSON.stringify(this._getCompressedState(true));
	}

	get rawStringCompressed() {
		return jsonFormat(this._getCompressedState(false));
	}

	get url() {
		let onlyTune: string | false | null = null;
		let onlyPattern: PatternReference | false | null = null;
		for(const tuneName in this.sharePatterns) {
			const patternNames = this.getModifiedPatternNames(tuneName);
			for(let i=0; i<patternNames.length; i++) {
				const patternName = patternNames[i];

				if(this.shouldExportPattern(tuneName, patternName)) {
					if(onlyTune == null)
						onlyTune = tuneName;
					else if(onlyTune != tuneName)
						onlyTune = false;

					if(onlyPattern == null)
						onlyPattern = [ tuneName, patternName ];
					else
						onlyPattern = false;
				}
			}
		}

		let url = "#/compose/" + encodeURIComponent(objectToString(this._getCompressedState(true)));
		if(onlyPattern)
			url += "/" + encodeURIComponent(onlyPattern[0]) + "/" + encodeURIComponent(onlyPattern[1]);
		else if(onlyTune)
			url += "/" + encodeURIComponent(onlyTune) + "/";

		return makeAbsoluteUrl(url);
	}

	getTuneClass(tuneName: string) {
		const patternNames = this.getModifiedPatternNames(tuneName);
		const enabled = patternNames.filter((patternName) => this.shouldExportPattern(tuneName, patternName)).length;

		if(enabled == 0)
			return "";
		else if(enabled == patternNames.length)
			return "active";
		else
			return "list-group-item-info";
	}

	isUsedInSong(tuneName: string, patternName: string) {
		return this.state.songs.some((song, songIdx) => this.shareSongs[songIdx] && songContainsPattern(song, tuneName, patternName));
	}

	shouldExportPattern(tuneName: string, patternName: string) {
		if(this.isUsedInSong(tuneName, patternName))
			return 2;
		else
			return this.sharePatterns[tuneName] && this.sharePatterns[tuneName][patternName] ? 1 : 0;
	}

	clickTune(tuneName: string) {
		const enable = (this.getTuneClass(tuneName) != "active");
		this.sharePatterns[tuneName] = { };
		if(enable) {
			for(const i in this.state.tunes[tuneName].patterns) {
				this.sharePatterns[tuneName][i] = true;
			}
		}
	}

	togglePattern(tuneName: string, patternName: string) {
		if(!this.sharePatterns[tuneName])
			this.sharePatterns[tuneName] = {};
		this.sharePatterns[tuneName][patternName] = !this.sharePatterns[tuneName][patternName]
	}

	getSongName(idx: number) {
		return getSongName(this.state, idx);
	}
	
}