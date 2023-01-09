import $ from "jquery";
import { stopAllPlayers } from "../../services/player";
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./overview.vue";
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
	readonly: boolean;
}

@WithRender
@Component({
	components: { Compatibility, Compose, Listen, StateProvider, Help, Update, PatternPlayer }
})
export default class Overview extends Vue {
	activeTab = 0;
	editorTab = null as { title:string; content: TabContent; previous: number } | null;

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
				this.editorTab =  { 
					title: `${data.pattern[0]}: ${data.pattern[1]}`,
					content: { type: "edit-pattern", tuneName: data.pattern[0], patternName: data.pattern[1], readonly: data.readonly},
					previous: this.activeTab
				};
				this.activeTab = 2
			},
			"overview-close-pattern-list": function() {
				$("body").removeClass("bb-pattern-list-visible");
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	listen() { 
		stopAllPlayers();
		events.$emit("overview-listen");
	}

	compose() { 
		stopAllPlayers();
		events.$emit("overview-compose");
	}

	edit() { 
		stopAllPlayers();
		events.$emit("edit-pattern-command", { pattern: [this.editorTab!.content.tuneName, this.editorTab!.content.patternName ], readonly: this.editorTab!.content.readonly })
	}	

	togglePatternList() {
		$("body").toggleClass("bb-pattern-list-visible");
	}

	closeTab() { 
		switch(this.editorTab!.previous) {
			case 0: this.listen(); break;
			case 1: this.compose(); break;
		}
		this.editorTab = null;
	}
}