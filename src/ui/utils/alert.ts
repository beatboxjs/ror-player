import { createApp } from 'vue';
import Alert, { AlertProps, AlertResult } from "./alert.vue";

async function renderAlert(props: AlertProps): Promise<AlertResult> {
	return await new Promise<AlertResult>((resolve) => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		const app = createApp(Alert, {
			...props,
			show: true,
			onHide: (result) => {
				app.unmount();
				el.remove();
				resolve(result);
			}
		} satisfies InstanceType<typeof Alert>['$props']);
		app.mount(el);
	});
}

export async function showAlert(props: Omit<AlertProps, 'type' | 'show'>): Promise<void> {
	await renderAlert({ ...props, type: 'alert' });
}

export async function showConfirm(props: Omit<AlertProps, 'type' | 'show'>): Promise<boolean> {
	const result = await renderAlert({ ...props, type: 'confirm' });
	return result.ok;
}
