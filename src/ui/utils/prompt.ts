import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import template from "./prompt.vue";
import $ from 'jquery';
import { sleep } from "../../utils";

export type Validate = (value: string) => string | null | undefined;

export async function openPromptDialog(instance: Vue, title: string, defaultValue?: string, validate?: Validate): Promise<string | undefined> {
	let result = defaultValue;
	const prompt = instance.$createElement(Prompt, {
		props: { defaultValue, validate },
		on: {
			change(value: string) {
				result = value;
			}
		}
	});

	const answer = await instance.$bvModal.msgBoxConfirm(prompt, { title });

	if(answer && (!validate || validate(result || "") == null)) {
		await sleep(); // Let modal close
		return result;
	}
}

@Component({
	template
})
export default class Prompt extends Vue {

	@Prop({ type: String, default: "" }) readonly defaultValue!: string;
	@Prop({ type: Function, default: (value: string) => null }) readonly validate!: Validate;

	value: string = "";

	get invalidFeedback() {
		return this.validate(this.value);
	}

	@Watch("value")
	onValueChange(value: string) {
		this.$emit("change", value);
	}

	mounted() {
		this.value = this.defaultValue;
	}

	submit() {
		if(!this.invalidFeedback)
			$(this.$el).closest(".modal-content").find("> footer > .btn-primary").click();
	}

}