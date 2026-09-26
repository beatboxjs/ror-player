<script setup lang="ts">
	import { computed } from "vue";
	import { useI18n } from "../../services/i18n";

	const props = defineProps<{
		modelValue: number;
		defaultSpeed: number;
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
	<div class="bb-practice-speed-slider">
		<label for="bb-practice-speed-slider" class="form-label">{{ i18n.t("practice.speed.label") }} <strong>{{ value }} BPM</strong></label>
		<input id="bb-practice-speed-slider" type="range" class="form-range" min="30" max="180" v-model.number="value">
		<button type="button" class="btn btn-secondary btn-sm mt-1" @click="emit('update:modelValue', props.defaultSpeed)">
			{{ i18n.t("practice.speed.reset") }}
		</button>
	</div>
</template>

<style lang="scss">
	.bb-practice-speed-slider {
		min-width: 180px;
	}
</style>
