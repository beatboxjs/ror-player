<script lang="ts" setup>
	import { computed, nextTick, ref } from 'vue';
	import { useModal } from './modal';

	export interface AlertProps {
		title: string;
		message: string;
		type?: "alert" | "confirm";
		variant?: "success" | "danger" | "warning";
		show?: boolean;
	}

	export interface AlertResult {
		ok: boolean;
	}

	const props = withDefaults(defineProps<AlertProps>(), {
		type: "alert"
	});

	const emit = defineEmits<{
		(type: 'update:show', show: boolean): void;
		(type: 'hide', result: AlertResult): void;
		(type: 'hidden', result: AlertResult): void;
	}>();

	const result = ref<AlertResult>({
		ok: false
	});

	const modal = useModal({
		show: computed(() => !!props.show),
		emit,
		onHide: () => {
			emit('hide', result.value);
		},
		onHidden: () => {
			emit('hidden', result.value);
		}
	});
</script>

<template>
	<div class="modal fade" tabindex="-1" aria-hidden="true" :ref="modal.ref">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5">{{props.title}}</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					{{props.message}}
				</div>
				<div class="modal-footer">
					<button v-if="type === 'confirm'" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
					<button type="button" class="btn" :class="`btn-${props.variant ?? 'primary'}`" @click="result.ok = true; modal.hide()">OK</button>
				</div>
			</div>
		</div>
	</div>
</template>