import Component from "vue-class-component";
import WithRender from "./stroke-dropdown.vue";
import Vue from "vue";
import config, { Instrument } from "../../config";
import { Model, Prop } from "vue-property-decorator";
import $ from "jquery";
import "./stroke-dropdown.scss";

@WithRender
@Component({
	components: { }
})
export default class StrokeDropdown extends Vue {

	@Prop({ type: String, required: true }) readonly instrument!: Instrument;
	@Model("change", { type: String }) readonly value?: string;

	sequence: string | null = null;
	keySequenceTimeout: number | null = null;

	mounted() {
		$(document).on({
			click: this.handleClick,
			keydown: this.handleKeyDown,
			keypress: this.handleKeyPress
		});
	}

	beforeDestroy() {
		$(document).off({
			click: this.handleClick,
			keydown: this.handleKeyDown,
			keypress: this.handleKeyPress
		});
	}

	get config() {
		return config;
	}

	getCurrentStrokeSequenceOptions() {
		let possibleStrokes = [] as Array<string>;

		if(!this.sequence)
			return possibleStrokes;

		for(let strokeKey of config.instruments[this.instrument].strokes) {
			let strokeDesc = config.strokes[strokeKey];

			if(strokeDesc.toLowerCase().startsWith(this.sequence))
				possibleStrokes.push(strokeKey);
		}
		return possibleStrokes;
	}

	handleKeyDown(e: KeyboardEvent) {
		if(e.ctrlKey || e.altKey || e.metaKey)
			return;

		 if(e.key == "Escape") {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.$emit("close");
		} else if(e.key == " ") {
			e.preventDefault();
			this.$emit("change", " ");
		}
	}

	handleClick(e: MouseEvent) {
		const el = e.target as HTMLElement;
		if(el.closest(".stroke-inner, .popover") == null) {
			e.preventDefault();
			this.$emit("close");
		}
	}

	handleKeyPress(e: KeyboardEvent) {
		if(this.keySequenceTimeout)
			clearTimeout(this.keySequenceTimeout);

		this.sequence = (this.sequence || "") + String.fromCharCode(e.which).toLowerCase();

		let options = this.getCurrentStrokeSequenceOptions();
		if(options.length == 1) {
			this.$emit("change", options[0]);
			this.sequence = null;
			return false;
		}

		this.keySequenceTimeout = window.setTimeout(() => { this.sequence = null; }, 1000);
	}

	handleSelect(stroke: string) {
		this.$emit("change", stroke);
	}
}