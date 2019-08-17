import "./compose.scss";
import Vue from "vue";
import Component from "vue-class-component";
import template from "./compose.vue";
import { InjectReactive, Prop, ProvideReactive, Ref } from "vue-property-decorator";
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

	@Ref() tunes!: HTMLElement;

	_unregisterHandlers!: () => void;

	touchStartX: number | null = null;

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"pattern-placeholder-drag-start"() {
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

	handleTouchStart(event: TouchEvent) {
		if(event.touches && event.touches[0] && $(event.target as EventTarget).closest("[draggable=true]").length == 0) {
			this.touchStartX = event.touches[0].clientX;
			$(this.tunes).css("transition", "none");
		}
	}

	handleTouchMove(event: TouchEvent) {
		if(this.touchStartX != null && event.touches[0]) {
			const left = Math.min(event.touches[0].clientX - this.touchStartX, 0);
			$(this.tunes).css("left", `${left}px`);
		}
	}

	handleTouchEnd(event: TouchEvent) {
		if(this.touchStartX != null && event.changedTouches[0]) {
			$(this.tunes).css({
				left: "",
				transition: ""
			});

			const left = Math.min(event.changedTouches[0].clientX - this.touchStartX, 0);
			if(left < -($(this.tunes).width() as number / 2))
				$("body").removeClass("bb-pattern-list-visible");

			this.touchStartX = null;
		}
	}

}