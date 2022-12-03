import $ from "jquery";
import { stopAllPlayers } from "../../services/player";
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./overview.vue";
import { Watch } from "vue-property-decorator";
import Compose from "../compose/compose";
import Listen from "../listen/listen";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import "./overview.scss";
import { StateProvider } from "../../services/history";
import Compatibility from "../compatibility/compatibility";
import Help from "../help/help";
import Update from "../update/update";
import PatternPlayer from "../pattern-player/pattern-player";

type TabContent = { 
	type: "edit-pattern";
	tuneName: string;
	patternName: string;
}

@WithRender
@Component({
	components: { Compatibility, Compose, Listen, StateProvider, Help, Update, PatternPlayer }
})
export default class Overview extends Vue {
	activeTab = 0;
	editorTab = null as {title:string; content: TabContent } | null;

	_unregisterHandlers!: () => void;

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			listen() {
				this.activeTab = 0;
			},
			compose() {
				this.activeTab = 1;
			},
			"edit-pattern" : function(data){
				console.log("overview handle edit-pattern")
				this.editorTab =  { 
					title: `${data.pattern[0]}: ${data.pattern[1]}`,
					content: { type: "edit-pattern", tuneName: data.pattern[0], patternName: data.pattern[1] }
				};
				Vue.nextTick().then(() => this.activeTab = 2);
			},
			"overview-close-pattern-list": function() {
				$("body").removeClass("bb-pattern-list-visible");
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	@Watch("activeTab")
	onActiveTabChange(activeTab: number) {
		stopAllPlayers();
		console.log("activeTab changed", activeTab)
		if (activeTab == 0)
			events.$emit("overview-listen");
		else if (activeTab == 1)
			events.$emit("overview-compose");
		else
			events.$emit("overview-edit-pattern", { pattern: [this.editorTab!.content.tuneName, this.editorTab!.content.patternName ], readonly: true })
	}

	togglePatternList() {
		$("body").toggleClass("bb-pattern-list-visible");
	}

	closeTab() { 
		this.editorTab = null;
		this.activeTab = 0;
	}
}