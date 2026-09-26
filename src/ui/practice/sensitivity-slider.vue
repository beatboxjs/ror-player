<script setup lang="ts">
	import { computed } from "vue";
	import { useI18n } from "../../services/i18n";

	const props = defineProps<{
		modelValue: number;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [v: number];
	}>();

	const i18n = useI18n();
	const value = computed({
		get: () => props.modelValue,
		set: (v) => emit("update:modelValue", v),
	});
</script>

<template>
	<div class="bb-practice-sensitivity-slider">
		<label for="bb-practice-sensitivity-slider" class="form-label">{{ i18n.t("practice.sensitivity.label") }} <strong>{{ value.toFixed(1) }}×</strong></label>
		<input id="bb-practice-sensitivity-slider" type="range" class="form-range" min="0.3" max="3" step="0.1" v-model.number="value">
		<button type="button" class="btn btn-secondary btn-sm mt-1" @click="value = 1">{{ i18n.t("practice.sensitivity.reset") }}</button>
	</div>
</template>

<style lang="scss">
	.bb-practice-sensitivity-slider {
		min-width: 180px;
	}
</style>
