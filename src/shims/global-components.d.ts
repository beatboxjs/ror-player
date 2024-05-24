import "@vue/runtime-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

declare module "@vue/runtime-core" {
	export interface GlobalComponents {
		fa: typeof FontAwesomeIcon;
	}
}