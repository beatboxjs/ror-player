import { computed, ref } from "vue";

const breakpointMinWidth = {
	// See https://getbootstrap.com/docs/5.3/layout/breakpoints/#available-breakpoints
	xs: 0,
	sm: 576,
	md: 768,
	lg: 992,
	xl: 1200,
	xxl: 1400
};

export type Breakpoint = keyof typeof breakpointMinWidth;

export const breakpoints = Object.keys(breakpointMinWidth) as Breakpoint[];

const update = ref(0);

const mediaQueries = Object.fromEntries(Object.entries(breakpointMinWidth).map(([breakpoint, minWidth]) => {
	const query = matchMedia(`(min-width: ${minWidth}px)`);
	query.addEventListener("change", () => {
		update.value++
	});
	return [breakpoint, query];
}));

export const reactiveBreakpoint = computed(() => {
	update.value;
	return [...breakpoints].reverse().find((breakpoint) => mediaQueries[breakpoint].matches) ?? 'xs';
});