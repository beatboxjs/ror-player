<script setup lang="ts">
	import config from '../../config';
	import { Pattern } from '../../state/pattern';

	type Value = Pattern['time'];

	const props = defineProps<{
		modelValue: Value;
		buttonClass?: any;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [value: Value];
	}>();

	const handleUpdate = (value: Value) => {
		emit("update:modelValue", value);
	};
</script>

<template>
	<div class="dropdown">
		<button class="btn btn-secondary dropdown-toggle" :class="buttonClass" data-bs-toggle="dropdown">{{config.times[props.modelValue]?.() || `${props.modelValue}⁄4`}}</button>
		<ul class="dropdown-menu">
			<li v-for="(desc, ti) in config.times" :key="ti"><a class="dropdown-item" :class="{ active: props.modelValue == ti }" href="javascript:" @click="handleUpdate(ti)" draggable="false">Time signature: {{desc()}}</a></li>
		</ul>
	</div>
</template>