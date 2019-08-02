import "./compose.scss";
import Vue from "vue";
import Component from "vue-class-component";
import template from "./compose.vue";
import { Prop, ProvideReactive } from "vue-property-decorator";
import { replaceSong, State } from "../../state/state";
import config from "../../config";
import { getEffectiveSongLength, SongPart } from "../../state/song";
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

	@ProvideReactive() state: State = history.state;

	_unregisterHandlers!: () => void;

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"update-state"(state: State) {
				if(isEqual(history.state, state))
					return;
				history.state = state;
				this.state = history.state;
			},
			"pattern-drag-start"() {
				events.$emit("overview-close-pattern-list");
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	patternClick(tuneName: string, patternName: string) {
		const song = clone(this.state.songs[this.state.songIdx]);
		if(!song)
			return;

		const songPart: SongPart = { } as SongPart;
		for(const instr of config.instrumentKeys) {
			songPart[instr] = [ tuneName, patternName ];
		}

		const newIdx = getEffectiveSongLength(song, this.state);
		song[newIdx] = songPart;

		events.$emit("update-state", replaceSong(this.state, this.state.songIdx, song));

		this.$nextTick(() => {
			scrollToElement($(".bb-song-player .song-container")[0], false, true);
		});
	}

}