import { computed, createApp, defineComponent, h, ref, VNode, VNodeArrayChildren, withDirectives } from 'vue';
import Alert, { AlertProps, AlertResult } from "./alert.vue";
import vValidity from './validity';

type ReactiveAlertProps = Omit<AlertProps, "title" | "message" | "okLabel"> & {
	title: AlertProps["title"] | (() => AlertProps["title"]);
	message: AlertProps["message"] | (() => AlertProps["message"]);
	okLabel?: AlertProps["okLabel"] | (() => AlertProps["okLabel"]);
};

async function renderAlert({ getContent, onShown, ...props }: ReactiveAlertProps & {
	getContent?: () => string | VNode | VNodeArrayChildren;
	onShown?: () => void;
}): Promise<AlertResult> {
	return await new Promise<AlertResult>((resolve) => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		const app = createApp(defineComponent({
			setup() {
				return () => h(Alert, {
					...props,
					title: typeof props.title === "function" ? props.title() : props.title,
					message: typeof props.message === "function" ? props.message() : props.message,
					okLabel: typeof props.okLabel === "function" ? props.okLabel() : props.okLabel,
					onShown: () => {
						onShown?.();
					},
					onHide: (result) => {
						resolve(result);
					},
					onHidden: () => {
						app.unmount();
						el.remove();
					}
				}, getContent);
			}
		}));
		app.mount(el);
	});
}

export async function showAlert(props: Omit<ReactiveAlertProps, 'type' | 'show'>): Promise<void> {
	await renderAlert({ ...props, type: 'alert' });
}

export async function showConfirm(props: Omit<ReactiveAlertProps, 'type' | 'show'>): Promise<boolean> {
	const result = await renderAlert({ ...props, type: 'confirm' });
	return result.ok;
}

export async function showPrompt({ initialValue = "", validate, ...props }: Omit<ReactiveAlertProps, 'type' | 'show' | 'message'> & {
	initialValue?: string;
	/** Validate the value. Return an empty string or undefined to indicate validity. */
	validate?: (value: string) => string | undefined;
}): Promise<string | undefined> {
	const value = ref(initialValue);
	const submitted = ref(false);
	const validationError = computed(() => submitted.value ? undefined : validate?.(value.value));
	const touched = ref(false);
	const inputRef = ref<HTMLInputElement>();

	const result = await renderAlert({
		...props,
		message: '',
		type: 'confirm',
		getContent: () => h('div', {
			class: `position-relative${touched.value ? ' was-validated' : ''}`
		}, [
			withDirectives(h('input', {
				type: "text",
				class: `form-control${touched.value ? ' was-validated' : ''}`,
				value: value.value,
				onInput: (e: InputEvent) => {
					value.value = (e.target as HTMLInputElement).value;
					touched.value = true;
				},
				onBlur: () => {
					touched.value = true;
				},
				autofocus: true,
				ref: inputRef
			}), [
				[vValidity, validationError.value]
			]),
			...(validationError.value ? [h('div', {
				class: "invalid-tooltip"
			}, validationError.value)] : [])
		]),
		onShown: () => {
			inputRef.value!.focus();
		}
	});

	submitted.value = true;

	return result.ok ? value.value : undefined;
}