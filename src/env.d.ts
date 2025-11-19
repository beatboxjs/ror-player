/// <reference types="vite/client" />

declare module "*.vue" {
	import type { DefineComponent } from "vue";
	type VueComponentWithExports = DefineComponent<{}, {}, any> & Record<string, unknown>;
	const component: VueComponentWithExports;
	export default component;
}

declare module "@vue/test-utils" {
	export * from "@vue/test-utils/dist/index";
}
