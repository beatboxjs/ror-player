import WithRender from "./popover.vue";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { id } from "../../utils";

@WithRender
@Component({ })
export default class Popover extends Vue {

	@Prop({ type: String, default: () => `bb-popover-${id()}` }) id!: string;
	@Prop({ type: String, default: "secondary" }) variant!: string;
	@Prop({ type: String }) title?: string;
	@Prop({ type: String }) customClass?: string;

}