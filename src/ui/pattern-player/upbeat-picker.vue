<script setup lang="ts">
	import { ThemeColour } from "../../services/bootstrap";
	import { useI18n } from '../../services/i18n';
	import { Pattern } from '../../state/pattern';

	type Value = Pattern['upbeat'];

	const props = withDefaults(defineProps<{
		modelValue: Value;
		time: Pattern['time'];
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
		<button class="btn dropdown-toggle" :class="`btn-${props.variant}`" data-bs-toggle="dropdown">{{i18n.t("upbeat-picker.upbeat", { upbeat: props.modelValue })}}</button>
		<ul class="dropdown-menu">
			<li v-for="i in props.time * 4 + 1" :key="i"><a class="dropdown-item" :class="{ active: props.modelValue == i - 1 }" href="javascript:" @click="handleUpdate(i - 1)" draggable="false">{{i18n.t("upbeat-picker.upbeat", { upbeat: i - 1 })}}</a></li>
		</ul>
	</div>
</template>