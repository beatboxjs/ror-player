import "./compose.scss";
import Vue from "vue";
import Component from "vue-class-component";
import template from "./compose.vue";
import { InjectReactive, Prop, ProvideReactive } from "vue-property-decorator";
import { State } from "../../state/state";
import config from "../../config";
import { appendSongPart, getEffectiveSongLength, SongPart } from "../../state/song";
import $ from "jquery";
import SongPlayer from "../song-player/song-player";
import PatternList from "../pattern-list/pattern-list";
import History from "../history/history";
import { PatternPlaceholderItem } from "../pattern-placeholder/pattern-placeholder";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import { scrollToElement } from "../../services/utils";
import history from "../../services/history";
import { clone } from "../../utils";
import isEqual from "lodash.isequal";

@Component({
	template,
	components: { PatternList, PatternPlaceholderItem, SongPlayer, History }
})
export default class Compose extends Vue {

	@InjectReactive() state!: State;

	_unregisterHandlers!: () => void;

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"pattern-drag-start"() {
				events.$emit("overview-close-pattern-list");
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	patternClick(tuneName: string, patternName: string) {
		const song = this.state.songs[this.state.songIdx];
		if(!song)
			return;

		const songPart: SongPart = { } as SongPart;
		for(const instr of config.instrumentKeys) {
			songPart[instr] = [ tuneName, patternName ];
		}

		appendSongPart(song, songPart, this.state);

		this.$nextTick(() => {
			scrollToElement($(".bb-song-player .song-container")[0], false, true);
		});
	}

}