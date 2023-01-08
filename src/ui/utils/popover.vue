<script lang="ts">
	import { onBeforeUnmount, onMounted, ref } from "vue";
	import { generateId } from "../../utils";
	import { Popover, Tooltip } from "bootstrap";

	/**
	 * Like Bootstrap Popover, but uses an existing popover element rather than creating a new one. This way, the popover
	 * content can be made reactive.
	 */
	export class CustomPopover extends Popover {
		declare _popper: any;
		contentEl: Element;

		constructor(trigger: string | Element, contentEl: Element, options?: Partial<Popover.Options>) {
			super(trigger, {
				content: ' ',
				...options
			});
			this.contentEl = contentEl;
		}

		_createTipElement(): Element {
			// Return content element rather than creating a new one
			return this.contentEl;
		}

		_disposePopper(): void {
			// Do not remove content element here
			if (this._popper) {
				this._popper.destroy()
				this._popper = null
			}
		}
	}
</script>

<script lang="ts" setup>
	const props = withDefaults(defineProps<{
		id?: string;
		variant?: string;
		title: string;
		tooltip?: string;
		customClass?: string;
	}>(), {
		id: () => `bb-popover-${generateId()}`,
		variant: "secondary"
	});

	const tooltipContainer = ref<HTMLElement | null>(null);
	const popoverButton = ref<HTMLElement | null>(null);
	const modalButton = ref<HTMLElement | null>(null);
	const popoverContent = ref<HTMLElement | null>(null);

	const handleDocumentClick = (e: MouseEvent) => {
		if (e.target instanceof Node && !popoverButton.value?.contains(e.target) && !popoverContent.value?.contains(e.target)) {
			popover?.hide();
		}
	};

	let popover: Popover | undefined;
	onMounted(() => {
		new Tooltip(tooltipContainer.value!, { placement: 'bottom' });
		popover = new CustomPopover(popoverButton.value!, popoverContent.value!, {
			placement: 'bottom',
			title: props.title,
			content: popoverContent.value!
		});
		document.addEventListener('click', handleDocumentClick, { capture: true });
	});

	onBeforeUnmount(() => {
		document.removeEventListener('click', handleDocumentClick, { capture: true });
	});
</script>

<template>
	<div class="bb-popover">
		<span :title="tooltip" ref="tooltipContainer">
			<button ref="popoverButton" type="button" class="btn d-none d-sm-inline" :class="`btn-${variant}`" :id="`${props.id}-popover-button`">
				<slot name="button"></slot>
			</button>

			<button ref="modalButton" type="button" class="btn d-sm-none" :class="`btn-${variant}`" :id="`${props.id}-modal-button`" data-bs-toggle="modal" :data-bs-target="`#${props.id}-modal`">
				<slot name="button"></slot>
			</button>
		</span>

		<div class="popover fade bs-popover-auto" :class="customClass" ref="popoverContent">
			<div class="popover-arrow"></div>
			<h3 class="popover-header">{{title}}</h3>
			<div class="popover-body">
				<slot></slot>
			</div>
		</div>

		<div :id="`${props.id}-modal`" class="modal fade" :class="customClass" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5">{{title}}</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<slot></slot>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-popover {
		> .popover:not(.show) {
			position: absolute;
			top: 0;
			left: 0;
			z-index: -1000;
			pointer-events: none;
		}
	}
</style>