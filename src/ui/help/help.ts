import config from "../../config";
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./help.vue";

@WithRender
@Component({})
export default class Help extends Vue {

	appName = config.appName;
	downloadFilename = config.appName.toLowerCase().replace(/[-_ ]+/g, "-") + '.html';

}
