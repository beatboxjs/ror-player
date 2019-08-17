import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import template from "./prompt.vue";

export type Validate = (value: string) => string | null | undefined;

export async function openPromptDialog(instance: Vue, title: string, defaultValue?: string, validate?: Validate): Promise<string | undefined> {
	let result = defaultValue;
	const prompt = instance.$createElement(Prompt, {
		props: { title, defaultValue, validate },
		on: {
			change(value: string) {
				result = value;
			}
		}
	});

	const answer = await instance.$bvModal.msgBoxConfirm(prompt, { title });

	if(answer && (!validate || validate(result || "") == null)) {
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

}