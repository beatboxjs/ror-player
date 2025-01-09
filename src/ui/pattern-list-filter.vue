<script lang="ts">
	import { getSortedTuneList, State } from "../state/state";
	import { tuneIsInCategory } from "../state/tune";
	import config, { Category } from "../config";
	import { computed } from "vue";

	export interface Filter {
		text: string;
		cat: Category;
	}

	export const DEFAULT_FILTER: Filter = { text: "", cat: "all" };

	export function filterPatternList(state: State, params?: Filter | null): string[] {
		params = params || DEFAULT_FILTER;

		const ret: string[] = [ ];
		const tuneNames = getSortedTuneList(state);
		const text = params && params.text.trim().toLowerCase() || "";
		for(let i = 0; i < tuneNames.length; i++) {
			if(text ? (tuneNames[i].toLowerCase().indexOf(text) != -1) : tuneIsInCategory(state.tunes[tuneNames[i]], params.cat))
				ret.push(tuneNames[i]);
		}
		return ret;
	}
</script>

<script lang="ts" setup>
	const props = withDefaults(defineProps<{
		modelValue?: Filter;
		showCustom?: boolean;
	}>(), {
		modelValue: () => ({ ...DEFAULT_FILTER }),
		showCustom: true
	});

	const emit = defineEmits<{
		"update:modelValue": [value: Filter];
	}>();

	const value = computed({
		get: () => props.modelValue,
		set: (value) => emit('update:modelValue', value)
	});

	const filterCats = computed(() => {
		const cats: Partial<Record<Category, string>> = Object.fromEntries(Object.entries(config.filterCats).map(([cat, desc]) => [cat, desc()]));
		if (!props.showCustom)
			delete cats.custom;
		return cats;
	});
</script>

<template>
	<div class="input-group bb-pattern-list-filter">
		<input type="text" class="form-control" :value="value.text" @input="value = { ...value, text: ($event.currentTarget as HTMLInputElement).value }" :placeholder="`Filter: ${filterCats[value.cat]}`" autofocus />
		<button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
		<ul class="dropdown-menu dropdown-menu-end">
			<li v-for="(val, key) in filterCats" :key="key">
				<a class="dropdown-item" :class="{ active: value.cat === key }" href="javascript:" @click="value = { ...value, cat: key }">{{val}}</a>
			</li>
		</ul>
	</div>
</template>

<style lang="scss">
	.bb-pattern-list-filter input {
		&::placeholder {
			color: #888;
			opacity: 1;
			font-style: italic;
		}
	}
</style>