import { Modal } from "bootstrap";
import { ref, Ref, watch } from "vue";

export interface ModalConfig {
	emit?: {
		(type: 'update:show', show: boolean): void;
	};
	show?: Ref<boolean>;
	onShow?: (event: Modal.Event) => void;
	onShown?: (event: Modal.Event) => void;
	onHide?: (event: Modal.Event) => void;
	onHidden?: (event: Modal.Event) => void;
}

export interface ModalActions {
	show: () => void;
	hide: () => void;
	ref: Ref<HTMLElement | undefined>;
}

export function useModal({ emit, show: showRef, onShow, onShown, onHide, onHidden }: ModalConfig): ModalActions {
	const modalRef = ref<HTMLElement>();

	const modal = ref<Modal>();

	const handleShow = (e: Event) => {
		onShow?.(e as Modal.Event);

		if (emit && showRef && showRef.value !== true) {
			emit('update:show', true);
		}
	};

	const handleShown = (e: Event) => {
		onShown?.(e as Modal.Event);
	};

	const handleHide = (e: Event) => {
		onHide?.(e as Modal.Event);
	};

	const handleHidden = (e: Event) => {
		onHidden?.(e as Modal.Event);

		if (emit && showRef && showRef.value !== false) {
			emit('update:show', false);
		}
	};

	watch(() => showRef?.value, () => {
		if (modal.value && showRef) {
			showRef.value ? show() : hide();
		}
	});

	watch(modalRef, (newRef, oldRef) => {
		if (modal.value) {
			modal.value.dispose();
			modal.value = undefined;

		}

		if (oldRef) {
			oldRef.removeEventListener('show.bs.modal', handleShow);
			oldRef.removeEventListener('shown.bs.modal', handleShown);
			oldRef.removeEventListener('hide.bs.modal', handleHide);
			oldRef.removeEventListener('hidden.bs.modal', handleHidden);
		}

		if (newRef) {
			modal.value = new Modal(newRef);
			newRef.addEventListener('show.bs.modal', handleShow);
			newRef.addEventListener('shown.bs.modal', handleShown);
			newRef.addEventListener('hide.bs.modal', handleHide);
			newRef.addEventListener('hidden.bs.modal', handleHidden);

			if (showRef?.value) {
				show();
			}
		}
	}, { immediate: true });

	const show = () => {
		if (!modal.value) {
			throw new Error('Modal is not initialized.');
		}
		modal.value.show();
	};

	const hide = () => {
		if (!modal.value) {
			throw new Error('Modal is not initialized.');
		}
		modal.value.hide();
	};

	return {
		show,
		hide,
		ref: modalRef
	};
}