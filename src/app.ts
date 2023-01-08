import { createApp } from "vue";
import "./bootstrap.scss";
import "bootstrap";
import "./app.scss";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
//import { enableRouter } from "./services/router";
import Overview from "./ui/overview.vue";
//import { registerServiceWorker } from "./services/service-worker";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretDown, faCheck, faClock, faCode, faCog, faCopy, faDownload, faEraser, faExclamationCircle, faInfoCircle, faFileExport, faFileImport, faHandPointRight, faHeadphones, faMobileAlt, faMusic, faPause, faPen, faPencilAlt, faPlay, faPlayCircle, faPlus, faQuestionCircle, faShare, faSlidersH, faStar, faStop, faTrash, faVolumeMute, faWindowClose } from '@fortawesome/free-solid-svg-icons'
import Vue3TouchEvents from "vue3-touch-events";

//registerServiceWorker();

library.add(faCaretDown, faCheck, faClock, faCode, faCog, faCopy, faDownload, faEraser, faExclamationCircle, faInfoCircle, faFileExport, faFileImport, faHandPointRight, faHeadphones, faMobileAlt, faMusic, faPause, faPen, faPencilAlt, faPlay, faPlayCircle, faPlus, faQuestionCircle, faShare, faSlidersH, faStar, faStop, faTrash, faVolumeMute, faWindowClose);

createApp(Overview)
	.use(Vue3TouchEvents)
	.component('fa', FontAwesomeIcon)
	.mount('#app');

document.getElementById('loading')!.remove();

//setTimeout(() => {
//	enableRouter(this);
//}, 0);
