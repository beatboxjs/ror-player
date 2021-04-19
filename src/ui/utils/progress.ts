import Component from "vue-class-component";
import WithRender from "./progress.vue";
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import "./progress.scss";

@WithRender
@Component({})
export default class Progress extends Vue {
	@Prop() readonly progress?: number | null;
}