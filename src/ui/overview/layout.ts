
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./layout.vue";
import "./layout.scss";
import './layout'
import Help from "../help/help";
import Update from "../update/update";
import Compatibility from "../compatibility/compatibility";
import { Watch } from "vue-property-decorator";
import { Route } from "vue-router";

@WithRender
@Component({components: { Compatibility, Update, Help  }})
export default class extends Vue {
	togglePatternList() {
		$("body").toggleClass("bb-pattern-list-visible");
	}

    @Watch('$route')
    showHidePatternList(route: Route) {
        setTimeout(() =>
		    $("body").toggleClass("bb-pattern-list-visible", !!route.meta?.showNav)
        , 1)
    }
}