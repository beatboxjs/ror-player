import { createApp, defineComponent, h } from "vue";
import "./bootstrap.scss";
import "bootstrap";
import "./app.scss";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Overview from "./ui/overview.vue";
//import { registerServiceWorker } from "./services/service-worker";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretDown, faCheck, faClock, faCode, faCog, faCopy, faDownload, faEraser, faExclamationCircle, faInfoCircle, faFileExport, faFileImport, faHandPointRight, faHeadphones, faMobileAlt, faMusic, faPause, faPen, faPencilAlt, faPlay, faPlayCircle, faPlus, faQuestionCircle, faShare, faSlidersH, faStar, faStop, faTrash, faVolumeMute, faWindowClose } from '@fortawesome/free-solid-svg-icons'
import Vue3TouchEvents from "vue3-touch-events";
import { reactiveLocalStorage } from "./services/localStorage";
import { reactiveLocationHash } from "./services/router";

// TODO
//registerServiceWorker();

library.add(faCaretDown, faCheck, faClock, faCode, faCog, faCopy, faDownload, faEraser, faExclamationCircle, faInfoCircle, faFileExport, faFileImport, faHandPointRight, faHeadphones, faMobileAlt, faMusic, faPause, faPen, faPencilAlt, faPlay, faPlayCircle, faPlus, faQuestionCircle, faShare, faSlidersH, faStar, faStop, faTrash, faVolumeMute, faWindowClose);

const Root = defineComponent({
	setup() {
		return () => h(Overview, {
			storage: reactiveLocalStorage,
			path: reactiveLocationHash.value,
			'onUpdate:path': (path) => {
				reactiveLocationHash.value = path;
			}
		});
	}
});

createApp(Root)
	.use(Vue3TouchEvents)
	.component('fa', FontAwesomeIcon)
	.mount('#app');

document.getElementById('loading')!.remove();
