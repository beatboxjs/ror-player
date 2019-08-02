import Vue from "vue";
import { normalizeState, State } from "../../state/state";
import Component from "vue-class-component";
import template from "./listen.vue";
import { Tune } from "../../state/tune";
import { stopAllPlayers } from "../../services/player";
import PatternListFilter, { Filter, filterPatternList } from "../pattern-list-filter/pattern-list-filter";
import TuneInfo from "../tune-info/tune-info";
import { ProvideReactive, Watch } from "vue-property-decorator";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import "./listen.scss";
import deepFreeze from "deep-freeze";

@Component({
	template,
	components: { PatternListFilter, TuneInfo },
	data: () => ({ filter: undefined })
})
export default class Listen extends Vue {
	@ProvideReactive() state = deepFreeze(normalizeState()) as State;

	tuneName: string | null = null;
	tune: Tune | null = null;
	filter?: Filter = undefined;

	_unregisterHandlers!: () => void;

	get tuneList() {
		return filterPatternList(this.state, this.filter);
	}

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			listen(tuneName: string) {
				if(!this.state.tunes[tuneName] || tuneName == this.tuneName)
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
		this.tuneName = tuneName;
		this.tune = this.state.tunes[tuneName];

		events.$emit("overview-close-pattern-list");

		stopAllPlayers();

		this.scrollToTune();
	}

	scrollToTune() {
		let list = $(".bb-listen-tunes > .nav", this.$el)[0];

		let el = $(".nav-item.active", list)[0];
		if(!el)
			return;

		if(list.scrollTop > el.offsetTop)
			$(list).animate({ scrollTop: el.offsetTop });
		else if(list.scrollTop < el.offsetTop + el.offsetHeight - list.offsetHeight)
			$(list).animate({ scrollTop: el.offsetTop + el.offsetHeight - list.offsetHeight});
	}
}