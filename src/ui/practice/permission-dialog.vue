<script setup lang="ts">
	import { useI18n } from "../../services/i18n";

	defineProps<{ open: boolean; }>();

	defineEmits<{
		"update:open": [v: boolean];
		"confirm": [];
	}>();

	const i18n = useI18n();
</script>

<template>
	<div v-if="open" class="modal-backdrop show"></div>
	<div v-if="open" class="modal d-block" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{{ i18n.t("practice.permission.title") }}</h5>
					<button type="button" class="btn-close" @click="$emit('update:open', false)"></button>
				</div>
				<div class="modal-body">
					<p>{{ i18n.t("practice.permission.body") }}</p>
					<p class="small text-muted">{{ i18n.t("practice.permission.privacy") }}</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="$emit('update:open', false)">{{ i18n.t("practice.permission.cancel") }}</button>
					<button type="button" class="btn btn-primary" @click="$emit('confirm')"><fa icon="microphone" /> {{ i18n.t("practice.permission.enable") }}</button>
				</div>
			</div>
		</div>
	</div>
</template>
