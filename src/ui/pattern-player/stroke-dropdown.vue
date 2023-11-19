<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref } from "vue";
	import config, { Instrument } from "../../config";
	import vTooltip from "../utils/tooltip";

	const props = defineProps<{
		instrument: Instrument;
		modelValue: string;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [value: string];
		"change-prev": [value: string];
		change: [value: string];
		prev: [];
		next: [];
		close: [];
	}>();

	const value = computed({
		get: () => props.modelValue,
		set: (value) => emit('update:modelValue', value)
	});

	const sequence = ref<string>();
	const keySequenceTimeout = ref<number>();

	onMounted(() => {
		document.addEventListener('click', handleClick);
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keypress', handleKeyPress);
	});

	onBeforeUnmount(() => {
		document.removeEventListener('click', handleClick);
		document.removeEventListener('keydown', handleKeyDown);
		document.removeEventListener('keypress', handleKeyPress);
	});

	const getCurrentStrokeSequenceOptions = () => {
		let possibleStrokes: string[] = [];

		if(!sequence.value)
			return possibleStrokes;

		for(let strokeKey of config.instruments[props.instrument].strokes) {
			let strokeDesc = config.strokes[strokeKey];

			if(strokeDesc.toLowerCase().startsWith(sequence.value))
				possibleStrokes.push(strokeKey);
		}
		return possibleStrokes;
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if(e.ctrlKey || e.altKey || e.metaKey)
			return;

		if(e.key == "Backspace") {
			e.preventDefault();
			emit("change-prev", " ");
			emit("prev");
		} else if(e.key == "ArrowLeft") {
			e.preventDefault();
			emit("prev");
		} else if(e.key == "ArrowRight") {
			e.preventDefault();
			emit("next");
		} else if(e.key == "Tab") {
			e.preventDefault();
			if (e.shiftKey) {
				emit("prev");
			} else {
				emit("next");
			}
		} else if(e.key == "Escape") {
			e.preventDefault();
			e.stopImmediatePropagation();
			emit("close");
		} else if(e.key == " ") {
			e.preventDefault();
			emit("change", " ");
			emit("next");
		}
	};

	const handleClick = (e: MouseEvent) => {
		if(!(e.target instanceof Element && e.target.closest(".stroke-inner"))) {
			e.preventDefault();
			emit("close");
		}
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if(e.ctrlKey || e.altKey || e.metaKey)
			return;

		if(keySequenceTimeout.value)
			clearTimeout(keySequenceTimeout.value);

		sequence.value = `${sequence.value || ""}${String.fromCharCode(e.which).toLowerCase()}`;

		let options = getCurrentStrokeSequenceOptions();
		if(options.length == 1) {
			emit("change", options[0]);
			emit("next");
			sequence.value = undefined;
			return false;
		}

		keySequenceTimeout.value = window.setTimeout(() => { sequence.value = undefined; }, 1000);

		return false;
	};

	const handleSelect = (stroke: string) => {
		emit("change", stroke);
		emit("close");
	};
</script>

<template>
	<div class="list-group bb-pattern-player-stokes-dropdown-menu">
		<a class="list-group-item list-group-item-action" :class="{ active: !sequence && (!value || value == ' ') }" href="javascript:" @click="handleSelect(' ')" draggable="false">&nbsp;</a>
		<a class="list-group-item list-group-item-action"
			v-for="stroke in config.instruments[instrument].strokes"
			:key="stroke"
			:class="{ active: sequence ? getCurrentStrokeSequenceOptions().includes(stroke) : value == stroke }"
			href="javascript:"
			@click="handleSelect(stroke)"
			v-tooltip="config.strokesDescription[stroke]"
			draggable="false"
		>
			{{config.strokes[stroke]}}
		</a>
	</div>
</template>

<style lang="scss">
	.bb-pattern-player-stokes-dropdown-menu {
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;

		.list-group-item {
			width: auto;
			padding: 5px 10px;
			margin: 1px 2px;
			border: 1px solid rgba(0, 0, 0, 0.125);
		}
	}
</style>