import "./history.scss";
import Vue from "vue";
import Component from "vue-class-component";
import template from "./history.vue";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import history from "../../services/history";
import { isoDate, readableDate } from "../../services/utils";
import $ from "jquery";
import { id } from "../../utils";

const globalData = Vue.observable({
	// Store this globally because History might not be rendered when link is opened
	showPopover: false
});

events.$on("history-load-encoded-string", () => {
	globalData.showPopover = true;

	$(document).one("click", () => {
		globalData.showPopover = false;
	});
});

@Component({
	template,
	components: { }
})
export default class History extends Vue {

	popoverId = `bb-history-popover-${id()}`;

	get showPopover() {
		return globalData.showPopover;
	}

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

	loadHistoricState(key: number) {
		history.loadHistoricState(key);
	}

	clearHistory() {
		history.clear();
	}

}