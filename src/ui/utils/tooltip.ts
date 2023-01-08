import { Tooltip } from "bootstrap";
import { Directive } from "vue";

declare global {
	interface Element {
		_bbTooltip?: Tooltip;
	}
}

declare module "bootstrap" {
	interface Tooltip {
		tip: Element | null;
		_newContent: Record<string, string> | null;
	}
}

const vTooltip: Directive<Element, string> = {
	mounted(el, binding) {
		el._bbTooltip = new Tooltip(el, {
			placement: 'bottom',
			title: binding.value ?? '',
			trigger: 'hover'
		});
	},

	updated(el, binding) {
		if (el._bbTooltip) {
			el._bbTooltip._newContent = { '.tooltip-inner': binding.value };

			const tooltipInner = el._bbTooltip.tip?.querySelector<HTMLElement>('.tooltip-inner');
			if (tooltipInner) {
				tooltipInner.innerText = binding.value;
			}
		}
	}
}

export default vTooltip;
