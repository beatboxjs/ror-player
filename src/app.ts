import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import "./bootstrap.scss";
import "./app.scss";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { enableRouter } from "./services/router";
import Vue2TouchEvents from "vue2-touch-events";
import {polyfill} from "mobile-drag-drop";
import {scrollBehaviourDragImageTranslateOverride} from "mobile-drag-drop/scroll-behaviour";
import Overview from "./ui/overview/overview";
import { registerServiceWorker } from "./services/service-worker";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretDown, faCheck, faClock, faCode, faCog, faCopy, faDownload, faEraser, faExclamationCircle, faInfoCircle, faFileExport, faFileImport, faHandPointRight, faHeadphones, faMobileAlt, faMusic, faPause, faPen, faPencilAlt, faPlay, faPlayCircle, faPlus, faShare, faSlidersH, faStar, faStop, faTrash, faVolumeMute, faWindowClose } from '@fortawesome/free-solid-svg-icons'

registerServiceWorker();

polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

Vue.use(BootstrapVue);
Vue.use(Vue2TouchEvents);

Vue.component('fa', FontAwesomeIcon);

library.add(faCaretDown, faCheck, faClock, faCode, faCog, faCopy, faDownload, faEraser, faExclamationCircle, faInfoCircle, faFileExport, faFileImport, faHandPointRight, faHeadphones, faMobileAlt, faMusic, faPause, faPen, faPencilAlt, faPlay, faPlayCircle, faPlus, faShare, faSlidersH, faStar, faStop, faTrash, faVolumeMute, faWindowClose);

new Vue({
	el: "#loading",
	render: (createElement) => createElement(Overview),
	mounted() {
		setTimeout(() => {
			enableRouter(this);
		}, 0);
	}
});
