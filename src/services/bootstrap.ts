import { computed, Ref, ref } from "vue";
import { reactiveLocalStorage } from "./localStorage";
import * as z from "zod";

export type ThemeColour = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "modified";

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

/**
 * Returns a reactive boolean that is true if the current breakpoint is the specified one or smaller.
 */
export function useMaxBreakpoint(breakpoint: Breakpoint): Ref<boolean> {
	return computed(() => breakpoints.indexOf(reactiveBreakpoint.value) <= breakpoints.indexOf(breakpoint));
}

/**
 * Returns a reactive boolean that is true if the current breakpoint is the specified one or larger.
 */
export function useMinBreakpoint(breakpoint: Breakpoint): Ref<boolean> {
	return computed(() => breakpoints.indexOf(reactiveBreakpoint.value) >= breakpoints.indexOf(breakpoint));
}

const prefersDarkModeQuery = matchMedia('(prefers-color-scheme: dark)');
const prefersDarkModeUpdate = ref(0);
const prefersDarkMode = computed(() => {
	prefersDarkModeUpdate.value;
	return prefersDarkModeQuery.matches;
});
prefersDarkModeQuery.addEventListener("change", () => {
	prefersDarkModeUpdate.value++;
});

const themePreferenceValidator = z.enum(["light", "dark"]).optional().catch(undefined);
type ThemePreference = z.infer<typeof themePreferenceValidator>;
export const themePreference = computed<ThemePreference>({
	get: () => themePreferenceValidator.parse(reactiveLocalStorage["theme"]),
	set: (val) => {
		if (val != null) {
			reactiveLocalStorage["theme"] = val;
		} else {
			delete reactiveLocalStorage["theme"];
		}
	}
});
export const theme = computed(() => themePreference.value ?? (prefersDarkMode.value ? "dark" : "light"));