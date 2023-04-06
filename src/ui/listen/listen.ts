import Vue from "vue";
import { normalizeState, State } from "../../state/state";
import Component from "vue-class-component";
import WithRender from "./listen.vue";
import { Tune } from "../../state/tune";
import { stopAllPlayers } from "../../services/player";
import PatternListFilter, { Filter, filterPatternList } from "../pattern-list-filter/pattern-list-filter";
import TuneInfo from "../tune-info/tune-info";
import { ProvideReactive, Ref, Watch } from "vue-property-decorator";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import "./listen.scss";
import $ from "jquery";

@WithRender
@Component({
	props: { tuneName: String },
	components: { PatternListFilter, TuneInfo },
	data: () => ({ filter: undefined })
})
export default class Listen extends Vue {
	@ProvideReactive() state = normalizeState();

	@Ref() tunes!: HTMLElement;

	tune: Tune | null = null;
	filter?: Filter = undefined;

	_unregisterHandlers!: () => void;

	touchStartX: number | null = null;

	get tuneList() {
		return filterPatternList(this.state, this.filter);
	}

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			listen(tuneName: string) {
				if(!this.state.tunes[tuneName] || tuneName == this.$props.tuneName)
					return;

				if(!filterPatternList(this.state, this.filter).includes(tuneName))
					this.filter = { text: "", cat: this.state.tunes[tuneName].categories[0] || "all" };

				this.selectTune(tuneName);
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	@Watch("tuneName")
	onTuneNameChange(tuneName: string) {
		if(tuneName)
			events.$emit("pattern-list-tune-opened", tuneName);
	}

	selectTune(tuneName: string) {
		this.$props.tuneName = tuneName;
		this.tune = this.state.tunes[tuneName];

		events.$emit("overview-close-pattern-list");

		stopAllPlayers();

		this.$nextTick(() => {
			this.scrollToTune();
		});
	}

	scrollToTune() {
		let list = $(".bb-listen-tunes > .nav", this.$el)[0];

		let el = $(".nav-link.active", list)[0];
		if(!el)
			return;

		if(list.scrollTop > el.offsetTop)
			$(list).animate({ scrollTop: el.offsetTop });
		else if(list.scrollTop < el.offsetTop + el.offsetHeight - list.offsetHeight)
			$(list).animate({ scrollTop: el.offsetTop + el.offsetHeight - list.offsetHeight});
	}

	handleTouchStart(event: TouchEvent) {
		if(event.touches && event.touches[0]) {
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