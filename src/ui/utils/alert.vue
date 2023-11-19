<script lang="ts" setup>
	import { ref } from 'vue';
	import { useModal } from './modal';

	export type AlertProps = {
		title: string;
		message: string;
		type?: "alert" | "confirm";
		variant?: "success" | "danger" | "warning";
	};

	export interface AlertResult {
		ok: boolean;
	}

	const props = withDefaults(defineProps<AlertProps>(), {
		type: "alert"
	});

	const emit = defineEmits<{
		shown: [];
		hide: [result: AlertResult];
		hidden: [result: AlertResult];
	}>();

	const result = ref<AlertResult>({
		ok: false
	});

	const modalRef = ref<HTMLElement>();
	const modal = useModal(modalRef, {
		onShown: () => {
			emit('shown');
		},
		onHide: () => {
			emit('hide', result.value);
		},
		onHidden: () => {
			emit('hidden', result.value);
		}
	});

	const formRef = ref<HTMLFormElement>();
	const formTouched = ref(false);
	const handleSubmit = () => {
		if (formRef.value!.checkValidity()) {
			result.value.ok = true;
			modal.hide();
		} else {
			formTouched.value = true;
		}
	};
</script>

<template>
	<Teleport to="body">
		<div class="modal fade" tabindex="-1" aria-hidden="true" ref="modalRef">
			<div class="modal-dialog">
				<form class="modal-content" :class="{ 'was-validated': formTouched }" @submit.prevent="handleSubmit()" novalidate ref="formRef">
					<div class="modal-header">
						<h1 class="modal-title fs-5">{{props.title}}</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<slot>{{props.message}}</slot>
					</div>
					<div class="modal-footer">
						<button v-if="type === 'confirm'" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="submit" class="btn" :class="`btn-${props.variant ?? 'primary'}`">OK</button>
					</div>
				</form>
			</div>
		</div>
	</Teleport>
</template>