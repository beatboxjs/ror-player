import config from "../../config";
import { Howler } from "howler";
import WithRender from "./compatibility.vue";
import Component from "vue-class-component";
import Vue from "vue";

@WithRender
@Component({})
export default class Compatibility extends Vue {
	appName = config.appName;
	compatible = Howler.usingWebAudio && ("btoa" in window);
	mp3 = Howler.codecs("mp3");
};
