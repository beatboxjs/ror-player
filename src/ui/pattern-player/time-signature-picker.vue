<script setup lang="ts">
	import config from '../../config';
	import { ThemeColour } from "../../services/bootstrap";
	import { useI18n } from '../../services/i18n';
	import { Pattern } from '../../state/pattern';

	type Value = Pattern['time'];

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
		<button class="btn dropdown-toggle" :class="`btn-${props.variant}`" data-bs-toggle="dropdown">{{config.times[props.modelValue]?.() || `${props.modelValue}⁄4`}}</button>
		<ul class="dropdown-menu">
			<li v-for="(desc, ti) in config.times" :key="ti"><a class="dropdown-item" :class="{ active: props.modelValue === Number(ti) }" href="javascript:" @click="handleUpdate(Number(ti))" draggable="false">{{i18n.t("time-signature-picker.time-signature", { time: desc() })}}</a></li>
		</ul>
	</div>
</template>