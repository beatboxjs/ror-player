<script lang="ts">
	import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
	import { Popover, Tooltip } from "bootstrap";
	import { useModal } from "./modal";

	/**
	 * Like Bootstrap Popover, but uses an existing popover element rather than creating a new one. This way, the popover
	 * content can be made reactive.
	 */
	export class CustomPopover extends Popover {
		declare _popper: any;
		contentEl: Element;

		constructor(trigger: string | Element, options: Partial<Popover.Options> & { content: Element }) {
			super(trigger, {
				...options,
				content: ' '
			});
			this.contentEl = options.content;
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
		variant?: string;
		title: string;
		tooltip?: string;
		customClass?: string;
	}>(), {
		variant: "secondary"
	});

	const tooltipContainer = ref<HTMLElement | null>(null);
	const popoverButton = ref<HTMLElement | null>(null);
	const popoverContent = ref<HTMLElement | null>(null);

	const showModal = ref(false);
	const modal = useModal({
		show: showModal,
		onHidden: () => {
			showModal.value = false;
		}
	});

	const showPopover = ref(false);
	const renderPopover = ref(false);

	watch(showPopover, async (show) => {
		if (show) {
			renderPopover.value = true;
			await nextTick();
			CustomPopover.getOrCreateInstance(popoverButton.value!, {
				placement: 'bottom',
				title: props.title,
				content: popoverContent.value!,
				trigger: 'manual'
			}).show();
		} else {
			CustomPopover.getInstance(popoverButton.value!)?.hide(); // Will be destroyed by hidden.bs.popover event listener
		}
	}, { immediate: true });

	const handleDocumentClick = (e: MouseEvent) => {
		if (e.target instanceof Node && !popoverButton.value?.contains(e.target) && !popoverContent.value?.contains(e.target)) {
			showPopover.value = false;
		}
	};

	onMounted(() => {
		new Tooltip(tooltipContainer.value!, { placement: 'bottom' });

		popoverButton.value!.addEventListener('hidden.bs.popover', () => {
			CustomPopover.getInstance(popoverButton.value!)?.dispose();
			renderPopover.value = false;
		});

		document.addEventListener('click', handleDocumentClick, { capture: true });
	});

	onBeforeUnmount(() => {
		document.removeEventListener('click', handleDocumentClick, { capture: true });

		Tooltip.getInstance(tooltipContainer.value!)?.dispose();
		CustomPopover.getInstance(popoverButton.value!)?.dispose();
	});
</script>

<template>
	<div class="bb-popover">
		<span :title="tooltip" ref="tooltipContainer">
			<button ref="popoverButton" type="button" class="btn d-none d-sm-inline" :class="`btn-${variant}`" @click="showPopover = !showPopover">
				<slot name="button"></slot>
			</button>

			<button type="button" class="btn d-sm-none" :class="`btn-${variant}`" @click="showModal = true">
				<slot name="button"></slot>
			</button>
		</span>

		<div v-if="renderPopover" class="popover fade bs-popover-auto" :class="customClass" ref="popoverContent">
			<div class="popover-arrow"></div>
			<h3 class="popover-header">{{title}}</h3>
			<div class="popover-body">
				<slot></slot>
			</div>
		</div>

		<Teleport to="body">
			<div v-if="showModal" class="modal fade" :class="customClass" tabindex="-1" aria-hidden="true" :ref="modal.ref">
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
		</Teleport>
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