<script setup lang="ts">
	import { ThemeColour } from "../../services/bootstrap";
	import { useI18n } from '../../services/i18n';
	import { Pattern } from '../../state/pattern';

	type Value = Pattern['length'];

	const props = withDefaults(defineProps<{
		modelValue: Value;
		variant?: ThemeColour;
	}>(), {
		variant: "secondary"
	});

	const emit = defineEmits<{
		"update:modelValue": [value: Value];
	}>();

	const i18n = useI18n();

	const handleUpdate = (value: Value) => {
		emit("update:modelValue", value);
	};
</script>

<template>
	<div class="dropdown">
		<button class="btn dropdown-toggle" :class="`btn-${props.variant}`" data-bs-toggle="dropdown">{{i18n.t("pattern-length-picker.length", { length: props.modelValue })}}</button>
		<ul class="dropdown-menu">
			<li v-for="le in [ 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64 ]" :key="le"><a class="dropdown-item" :class="{ active: props.modelValue === le }" href="javascript:" @click="handleUpdate(le)" draggable="false">{{i18n.t("pattern-length-picker.length", { length: le })}}</a></li>
		</ul>
	</div>
</template>