import "./pattern-editor-dialog.scss";
import Component from "vue-class-component";
import template from "./pattern-editor-dialog.vue";
import { BeatboxReference, stopAllPlayers } from "../../services/player";
import { InjectReactive, Prop, Ref, Vue } from "vue-property-decorator";
import { getPatternFromState, State } from "../../state/state";
import defaultTunes from "../../defaultTunes";
import { Pattern, patternEquals } from "../../state/pattern";
import PatternPlayer from "../pattern-player/pattern-player";
import { BModal } from "bootstrap-vue";
import ShareDialog from "../share-dialog/share-dialog";
import { id } from "../../utils";

@Component({
	template,
	components: { PatternPlayer, ShareDialog }
})
export default class PatternEditorDialog extends Vue {

	@Prop({ type: String, required: true }) readonly id!: string;
	@Prop({ type: String, required: true }) readonly tuneName!: string;
	@Prop({ type: String, required: true }) readonly patternName!: string;
	@Prop({ type: Boolean, default: false }) readonly readonly!: boolean;
	@Prop(Object) readonly playerRef?: BeatboxReference;

	@InjectReactive() readonly state!: State;

	@Ref() readonly modal!: BModal;

	shareDialogId = `bb-share-dialog-${id()}`;

	handleHide() {
		stopAllPlayers();
	};

	mounted() {
		this.modal.$on("hide", this.handleHide);
	}

	get pattern() {
		return getPatternFromState(this.state, this.tuneName, this.patternName) as Pattern;
	}

	get originalPattern() {
		return defaultTunes.getPattern(this.tuneName, this.patternName);
	}

	get title() {
		return `${this.state.tunes[this.tuneName].displayName || this.tuneName} – ${this.state.tunes[this.tuneName].patterns[this.patternName].displayName || this.patternName}`;
	}

	get hasChanged() {
		return !this.originalPattern || !patternEquals(this.originalPattern, this.pattern);
	}

	share() {
		this.$bvModal.show(this.shareDialogId);
	};

}