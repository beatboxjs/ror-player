
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./layout.vue";
import "./layout.scss";
import './layout'
import Help from "../help/help";
import Update from "../update/update";
import Compatibility from "../compatibility/compatibility";
import { Watch } from "vue-property-decorator";

@WithRender
@Component({components: { Compatibility, Update, Help  }})
export default class extends Vue {
	togglePatternList() {
		$("body").toggleClass("bb-pattern-list-visible");
	}

    @Watch('$route')
    onRouteChange() {
		$("body").removeClass("bb-pattern-list-visible");
    }
}