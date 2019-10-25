import Component from "vue-class-component";
import template from "./progress.vue";
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import "./progress.scss";

@Component({
	template
})
export default class Progress extends Vue {
	@Prop() readonly progress?: number | null;
}