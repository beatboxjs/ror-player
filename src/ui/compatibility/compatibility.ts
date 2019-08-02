import config from "../../config";
import { Howler } from "howler";
import template from "./compatibility.vue";
import Component from "vue-class-component";
import Vue from "vue";

@Component({
	template
})
export default class Compatibility extends Vue {
	appName = config.appName;
	compatible = Howler.usingWebAudio && ("btoa" in window);
	mp3 = Howler.codecs("mp3");
};
