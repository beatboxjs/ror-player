import Component from "vue-class-component";
import template from "./stroke-dropdown.vue";
import Vue from "vue";
import config, { Instrument } from "../../config";
import { Model, Prop } from "vue-property-decorator";
import $ from "jquery";
import "./stroke-dropdown.scss";

@Component({
	template,
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

		if(e.key == "Backspace") {
			e.preventDefault();
			this.$emit("change", " ");
			this.$emit("prev");
		} else if(e.key == "ArrowLeft") {
			e.preventDefault();
			this.$emit("prev");
		} else if(e.key == "ArrowRight") {
			e.preventDefault();
			this.$emit("next");
		} else if(e.key == "Tab") {
			e.preventDefault();
			this.$emit(e.shiftKey ? "prev" : "next");
		} else if(e.key == "Escape") {
			e.preventDefault();
			this.$emit("close");
		} else if(e.key == " ") {
			e.preventDefault();
			this.$emit("change", " ");
			this.$emit("next");
		}
	}

	handleClick(e: MouseEvent) {
		const el = $(e.target as any);
		if(el.closest(".stroke-inner").length == 0) {
			e.preventDefault();
			this.$emit("close");
		}
	}

	handleKeyPress(e: KeyboardEvent) {
		if(e.ctrlKey || e.altKey || e.metaKey)
			return;

		clearTimeout(this.keySequenceTimeout);
		this.keySequenceTimeout = setTimeout(() => { this.sequence = null; }, 1000);

		this.sequence = (this.sequence || "") + String.fromCharCode(e.which).toLowerCase();

		if(this.sequence.length == 1) {
			let options = this.getCurrentStrokeSequenceOptions();
			if(options.length == 1) {
				this.$emit("change", options[0]);
				this.$emit("next");
				return false;
			}
		}

		return false;
	}

	handleSelect(stroke: string) {
		this.$emit("change", stroke);
		this.$emit("close");
	}

}