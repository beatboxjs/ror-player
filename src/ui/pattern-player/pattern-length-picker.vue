<script setup lang="ts">
	import { useI18n } from '../../services/i18n';
	import { Pattern } from '../../state/pattern';

	type Value = Pattern['length'];

	const props = defineProps<{
		modelValue: Value;
		buttonClass?: any;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [value: Value];
	}>();

	const i18n = useI18n();

	const handleUpdate = (value: Value) => {
		emit("update:modelValue", value);
	};

	const lengths = Array.from({ length: 64 }, (_, i) => i + 1);
</script>

<template>
	<div class="dropdown">
		<button class="btn btn-secondary dropdown-toggle" :class="props.buttonClass" data-bs-toggle="dropdown">{{i18n.t("pattern-length-picker.length", { length: props.modelValue })}}</button>
		<ul class="dropdown-menu">
			<li v-for="le in lengths" :key="le"><a class="dropdown-item" :class="{ active: props.modelValue === le, 'highlight': le % 4 === 0 }" href="javascript:" @click="handleUpdate(le)" draggable="false">{{i18n.t("pattern-length-picker.length", { length: le })}}</a></li>
		</ul>
	</div>
</template>

<style scoped>
.highlight {
    font-weight: bold;
}
</style>
