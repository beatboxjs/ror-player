import "./pattern-list.scss";
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./pattern-list.vue";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";
import {
	copyTune,
	createPattern,
	createTune,
	getPatternFromState,
	removePattern, removeTune,
	renameTune,
	State
} from "../../state/state";
import PatternListFilter, { DEFAULT_FILTER, Filter, filterPatternList } from "../pattern-list-filter/pattern-list-filter";
import { openPromptDialog } from "../utils/prompt";
import defaultTunes from "../../defaultTunes";
import PatternPlaceholder, { PatternPlaceholderItem } from "../pattern-placeholder/pattern-placeholder";
import { clone, id } from "../../utils";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import RenamePatternDialog from "./rename-pattern-dialog";
import PatternEditorDialog from "../pattern-editor-dialog/pattern-editor-dialog";
import Collapse from "../utils/collapse";

type Opened = {
	[tuneName: string]: boolean
}

@WithRender
@Component({
	components: { PatternListFilter, PatternPlaceholder, PatternPlaceholderItem, PatternEditorDialog, RenamePatternDialog, Collapse }
})
export default class PatternList extends Vue {

	@InjectReactive() readonly state!: State;

	filter: Filter = DEFAULT_FILTER;
	isOpened: Opened = {};
	previousIsOpened: Opened = {};
	showPatternEditor: {id: string, tuneName: string, patternName: string} | null = null;
	showRename: {id: string, tuneName: string, patternName: string} | null = null;

	_unregisterHandlers!: () => void;

	@Watch("isOpened", { deep: true })
	onOpenedChange(newOpen: Opened) {
		for(const i in newOpen) {
			if(!!newOpen[i] != !!this.previousIsOpened[i]) {
				events.$emit(newOpen[i] ? "pattern-list-tune-opened" : "pattern-list-tune-closed", i);
			}
		}
		this.previousIsOpened = clone(newOpen);
	}

	@Watch("filter", { deep: true })
	onFilterChange() {
		const visibleTunes = filterPatternList(this.state, this.filter);
		for(const i in this.isOpened) {
			if(this.isOpened[i] && visibleTunes.indexOf(i) == -1)
				events.$emit("pattern-list-tune-closed", i);
		}
	}


	get visibleTunes() {
		return filterPatternList(this.state, this.filter).map((tuneName) => ({
			tuneName,
			isCustom: this.isCustomTune(tuneName),
			displayName: this.state.tunes[tuneName].displayName || tuneName,
			patterns: Object.keys(this.state.tunes[tuneName].patterns).map((patternName) => ({
				patternName,
				isCustom: this.isCustomPattern(tuneName, patternName)
			})),
			collapseId: `bb-pattern-list-collapse-${id()}`,
			height: Object.keys(this.state.tunes[tuneName].patterns).length * 50 + 24
		}));
	}

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"pattern-list-open-tune"(tuneName: string) {
				if(!this.state.tunes[tuneName])
					return;

				Vue.set(this.isOpened, tuneName, true);

				if(!filterPatternList(this.state, this.filter).includes(tuneName))
					this.filter = { text: "", cat: this.isCustomTune(tuneName) ? "custom" : (this.state.tunes[tuneName].categories[0] || "all") };
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	async createPatternInTune(tuneName: string) {
		const newPatternName = await openPromptDialog(this, "New break", "", (newPatternName) => {
			if(newPatternName.trim().length == 0)
				return "Please enter a name for the new break.";
			if(getPatternFromState(this.state, tuneName, newPatternName))
				return "This name is already taken. Please enter a different one.";
		});

		if(newPatternName) {
			createPattern(this.state, tuneName, newPatternName);
			events.$emit("edit-pattern-command", { pattern: [ tuneName, newPatternName ], readonly: false })
		}
	}

	async copyPattern(tuneName: string, patternName: string) {
		this.showRename = { id: `bb-rename-pattern-dialog-${id()}`, tuneName, patternName };
		await this.$nextTick();
		this.$bvModal.show(this.showRename.id);
	}

	async removePatternFromTune(tuneName: string, patternName: string) {
		if(await this.$bvModal.msgBoxConfirm("Do you really want to remove "+patternName+" ("+tuneName+")?")) {
			removePattern(this.state, tuneName, patternName);
		}
	}

	isCustomPattern(tuneName: string, patternName: string) {
		return !defaultTunes.getPattern(tuneName, patternName);
	}

	isCustomTune(tuneName: string) {
		return defaultTunes[tuneName] == null;
	}

	async createTune() {
		const newTuneName = await openPromptDialog(this, "Create tune", "", (newTuneName) => {
			if(newTuneName.trim().length == 0)
				return "Please enter a name for the new tune.";
			if(this.state.tunes[newTuneName])
				return "This name is already taken. Please enter a different one.";
		});

		if(newTuneName) {
			createTune(this.state, newTuneName);

			Vue.set(this.isOpened, newTuneName,  true);
			if (!filterPatternList(this.state, this.filter).includes(newTuneName))
				this.filter = { text: "", cat: "custom" };

			createPattern(this.state, newTuneName, "Tune", { loop: true });
			this.showPatternEditor = { id: `bb-pattern-editor-dialog-${id()}`, tuneName: newTuneName, patternName: "Tune" };
			await this.$nextTick();
			this.$bvModal.show(this.showPatternEditor.id);
		}
	}

	async renameTune(tuneName: string) {
		const newTuneName = await openPromptDialog(this, "Rename tune", tuneName, (newTuneName) => {
			if(newTuneName.trim().length == 0 || newTuneName == tuneName)
				return "Please enter a new name for the tune.";
			if(this.state.tunes[newTuneName])
				return "This name is already taken. Please enter a different one.";
		});

		if(newTuneName) {
			renameTune(this.state, tuneName, newTuneName);
		}
	};

	async copyTune(tuneName: string) {
		const newTuneName = await openPromptDialog(this, "Copy tune", tuneName, (newTuneName) => {
			if(newTuneName.trim().length == 0 || newTuneName == tuneName)
				return "Please enter a new name for the tune.";
			if(this.state.tunes[newTuneName])
				return "This name is already taken. Please enter a different one.";
		});

		if(newTuneName) {
			copyTune(this.state, tuneName, newTuneName);
		}
	};

	async removeTune(tuneName: string) {
		if(await this.$bvModal.msgBoxConfirm(`Do you really want to remove the tune ${tuneName}?`)) {
			removeTune(this.state, tuneName);
		}
	};

	toggleTune(tuneName: string) {
		Vue.set(this.isOpened, tuneName, !this.isOpened[tuneName]);
	}
}