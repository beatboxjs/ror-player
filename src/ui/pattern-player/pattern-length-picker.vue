<script setup lang="ts">
	import { Pattern } from '../../state/pattern';

	type Value = Pattern['length'];

	const props = defineProps<{
		modelValue: Value;
		buttonClass?: any;
	}>();

	const emit = defineEmits<{
		(type: "update:modelValue", value: Value): void;
	}>();

	const handleUpdate = (value: Value) => {
		emit("update:modelValue", value);
	};
</script>

<template>
	<div class="dropdown">
		<button class="btn btn-light dropdown-toggle" :class="props.buttonClass" data-bs-toggle="dropdown">Length: {{props.modelValue}}</button>
		<ul class="dropdown-menu">
			<li v-for="le in [ 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64 ]" :key="le"><a class="dropdown-item" :class="{ active: props.modelValue === le }" href="javascript:" @click="handleUpdate(le)" draggable="false">Length: {{le}}</a></li>
		</ul>
	</div>
</template>