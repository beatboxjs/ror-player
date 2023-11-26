import "vue";

declare module "vue" {
	export interface HTMLAttributes {
		dataBsToggle?: "dropdown" | "modal";
		dataBsTarget?: string;
		dataBsDismiss?: "modal";
	}
}