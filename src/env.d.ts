/// <reference types="vite/client" />

declare module "*.vue" {
	import type { DefineComponent } from "vue";
	type VueComponentWithExports = DefineComponent<{}, {}, any> & Record<string, unknown>;
	const component: VueComponentWithExports;
	export default component;
}

