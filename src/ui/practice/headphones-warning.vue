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
					<h5 class="modal-title">{{ i18n.t("practice.headphones.title") }}</h5>
				</div>
				<div class="modal-body">
					<p>{{ i18n.t("practice.headphones.body") }}</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" @click="$emit('confirm')">{{ i18n.t("practice.headphones.continue") }}</button>
				</div>
			</div>
		</div>
	</div>
</template>
