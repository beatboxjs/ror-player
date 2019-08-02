import config from "../../config";
import Compatibility from "../compatibility/compatibility";
import Overview from "../overview/overview";
import Vue from "vue";
import Component from "vue-class-component";
import "./main.scss";
import template from "./main.vue";

@Component({
	template,
	components: { Compatibility, Overview }
})
export default class Main extends Vue {

	appName = config.appName;
	downloadFilename = config.appName.toLowerCase().replace(/[-_ ]+/g, "-") + '.html';

}
