<script lang="ts">
	/**
	 * Renders a button that opens a popover on large screens and a modal on small screens.
	 */
	export default {};
</script>

<script setup lang="ts">
	import { computed, ref } from "vue";
	import { useModal } from "./modal";
	import { breakpoints, reactiveBreakpoint } from "../../services/bootstrap";
	import vTooltip from "./tooltip";
	import Popover from "./popover.vue";

	const props = withDefaults(defineProps<{
		variant?: string;
		title: string;
		tooltip?: string;
		customClass?: string;
	}>(), {
		variant: "secondary",
		forcePopover: false
	});

	const shouldUseModal = computed(() => breakpoints.indexOf(reactiveBreakpoint.value) < breakpoints.indexOf("sm"));

	const button = ref<HTMLElement>();

	const showModal = ref(false);
	const modal = useModal({
		show: showModal,
		onHidden: () => {
			showModal.value = false;
		}
	});

	const showPopover = ref(false);

	const handleClick = () => {
		if (shouldUseModal.value) {
			showModal.value = true;
		} else {
			showPopover.value = !showPopover.value;
		}
	};
</script>

<template>
	<div class="bb-popover">
		<span v-tooltip="tooltip">
			<button ref="button" type="button" class="btn" :class="`btn-${props.variant}`" @click="handleClick()">
				<slot name="button"></slot>
			</button>
		</span>

		<Popover v-model:show="showPopover" :element="button" :class="props.customClass" hide-on-outside-click>
			<template v-slot:header>
				{{props.title}}
			</template>
			<slot></slot>
		</Popover>

		<Teleport to="body">
			<div v-if="showModal" class="modal fade" :class="props.customClass" tabindex="-1" aria-hidden="true" :ref="modal.ref">
				<div class="modal-dialog modal-dialog-scrollable">
					<div class="modal-content">
						<div class="modal-header">
							<h1 class="modal-title fs-5">{{props.title}}</h1>
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