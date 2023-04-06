
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./layout.vue";
import "./layout.scss";
import './layout'
import Help from "../help/help";
import Update from "../update/update";
import Compatibility from "../compatibility/compatibility";

@WithRender
@Component({components: { Compatibility, Update, Help  }})
export default class extends Vue {
	togglePatternList() {
		$("body").toggleClass("bb-pattern-list-visible");
	}
}