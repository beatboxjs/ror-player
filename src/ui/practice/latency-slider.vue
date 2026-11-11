<script setup lang="ts">
	import { computed } from "vue";
	import { useI18n } from "../../services/i18n";

	const props = defineProps<{
		modelValue: number;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [v: number];
		"calibrate": [];
	}>();

	const i18n = useI18n();
	const value = computed({
		get: () => props.modelValue,
		set: (v) => emit("update:modelValue", v),
	});
</script>

<template>
	<div class="bb-practice-latency-slider">
		<label for="bb-practice-latency-slider" class="form-label">{{ i18n.t("practice.latency.label") }} <strong>{{ value }} ms</strong></label>
		<input id="bb-practice-latency-slider" type="range" class="form-range" min="-300" max="300" step="5" v-model.number="value">
		<button type="button" class="btn btn-secondary btn-sm mt-1" @click="emit('calibrate')">
			<fa icon="sliders-h" /> {{ i18n.t("practice.latency.calibrate") }}
		</button>
	</div>
</template>

<style lang="scss">
	.bb-practice-latency-slider {
		min-width: 180px;
	}
</style>
