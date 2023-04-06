import "./compose.scss";
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./compose.vue";
import { InjectReactive, Ref } from "vue-property-decorator";
import { State } from "../../state/state";
import { allInstruments, appendSongPart } from "../../state/song";
import $ from "jquery";
import SongPlayer from "../song-player/song-player";
import PatternList from "../pattern-list/pattern-list";
import History from "../history/history";
import { PatternPlaceholderItem } from "../pattern-placeholder/pattern-placeholder";
import events, { registerMultipleHandlers } from "../../services/events";
import { scrollToElement } from "../../services/utils";
import { ensurePersistentStorage } from "../../services/localStorage";
import { StateProvider } from "../../services/history";

@WithRender
@Component({
	components: { PatternList, PatternPlaceholderItem, SongPlayer, History, StateProvider }
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

		ensurePersistentStorage();
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	patternClick(tuneName: string, patternName: string) {
		const song = this.state.songs[this.state.songIdx];
		if(!song)
			return;

		appendSongPart(song, allInstruments([ tuneName, patternName]), this.state);

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