import Vue from "vue";
import Component from "vue-class-component";
import template from "./rename-pattern-dialog.vue";
import { copyPattern, getPatternFromState, getSortedTuneList, movePattern, State } from "../../state/state";
import { InjectReactive, Prop } from "vue-property-decorator";
import defaultTunes from "../../defaultTunes";
import events from "../../services/events";

@Component({
	template
})
export default class RenamePatternDialog extends Vue {
	@InjectReactive() state!: State;

	@Prop(String) id?: string;
	@Prop({ type: String, required: true }) tuneName!: string;
	@Prop({ type: String, required: true }) patternName!: string;

	newTuneName: string = null as any;
	newPatternName: string = null as any;
	copy: boolean = false;

	created() {
		this.newTuneName = this.tuneName;
		this.newPatternName = this.patternName;
	}

	get exists() {
		return !!getPatternFromState(this.state, this.newTuneName, this.newPatternName);
	};

	get changed() {
		return (this.tuneName != this.newTuneName.trim() || this.patternName != this.newPatternName.trim()) && this.newPatternName.trim() != "";
	}

	get title() {
		return `${this.copy ? 'Copy' : this.tuneName == this.newTuneName ? 'Rename' : 'Move'} break`;
	}

	get isCustom() {
		return !defaultTunes.getPattern(this.tuneName, this.patternName);
	}

	get targetTuneOptions() {
		return getSortedTuneList(this.state);
	}

	submit() {
		if(this.copy)
			copyPattern(this.state, [ this.tuneName, this.patternName ], [ this.newTuneName.trim(), this.newPatternName.trim() ]);
		else
			movePattern(this.state, [ this.tuneName, this.patternName ], [ this.newTuneName.trim(), this.newPatternName.trim() ]);
	}
}