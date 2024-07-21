import "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

declare module "vue" {
	export interface GlobalComponents {
		fa: typeof FontAwesomeIcon;
	}
}