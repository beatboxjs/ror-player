import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./collapse.vue";
import { BCollapse } from "bootstrap-vue";
import { Model, Prop, Ref, Watch } from "vue-property-decorator";

@WithRender
@Component({})
export default class Collapse extends Vue {

	@Prop({ type: String, required: true }) id!: string;
	@Prop({ type: Number, default: 0 }) height!: number;
	@Ref() ref!: BCollapse;
	@Model("input", { type: Boolean, default: false }) readonly visible!: boolean;

	shown: boolean = false;

	created() {
		this.shown = this.visible;
	}

}
