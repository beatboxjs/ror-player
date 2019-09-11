import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import "./app.scss";
import "@fortawesome/fontawesome-free/scss/fontawesome.scss"
import "@fortawesome/fontawesome-free/scss/solid.scss"
import { enableRouter } from "./services/router";
import Vue2TouchEvents from "vue2-touch-events";
import {polyfill} from "mobile-drag-drop";
import {scrollBehaviourDragImageTranslateOverride} from "mobile-drag-drop/scroll-behaviour";
import Overview from "./ui/overview/overview";
import { registerServiceWorker } from "./services/service-worker";

registerServiceWorker();

polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

Vue.use(BootstrapVue);
Vue.use(Vue2TouchEvents);

new Vue({
	el: "#loading",
	render: (createElement) => createElement(Overview),
	mounted() {
		enableRouter(this);
	}
});
