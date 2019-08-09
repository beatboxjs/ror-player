import "./history.scss";
import Vue from "vue";
import Component from "vue-class-component";
import template from "./history.vue";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import history from "../../services/history";
import { isoDate, readableDate } from "../../services/utils";
import $ from "jquery";
import { id } from "../../utils";

@Component({
	template,
	components: { }
})
export default class History extends Vue {

	popoverMessage: string | null = null;
	popoverId = `bb-history-popover-${id()}`;
	_unregisterHandlers!: () => void;

	get historicStates() {
		const states = history.getHistoricStates();
		const currentKey = history.getCurrentKey();
		return states.map((key, i) => ({
			key,
			readableDate: readableDate(key, states[i-1], states[i+1]),
			isoDate: isoDate(key),
			isCurrent: key == currentKey
		}));
	}

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"history-load-encoded-string"() {
				this.popoverMessage = "You have opened a shared view. Your previous songs and tunes can be restored here.";
				this.$nextTick().then(() => {
					this.$root.$emit("bv::show::popover", this.popoverId);
				});
				$(this.$el).one("click", () => {
					this.popoverMessage = null;
				});
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	loadHistoricState(key: number) {
		history.loadHistoricState(key);
	}

	clearHistory() {
		history.clear();
	}

}