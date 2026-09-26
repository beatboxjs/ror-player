import { expect, test } from "vitest";
import { listParts, defaultPartName, resolvePartName } from "../practiceParts";

test("defaultPartName prefers 'Tune' when present", () => {
	expect(defaultPartName(["Break 1", "Tune", "Break 2"])).toBe("Tune");
});

test("defaultPartName falls back to the first part when 'Tune' is absent", () => {
	// e.g. the "General Breaks" category has no "Tune" pattern
	expect(defaultPartName(["Karla Break", "8 up", "8 down"])).toBe("Karla Break");
});

test("defaultPartName returns undefined for an empty tune", () => {
	expect(defaultPartName([])).toBeUndefined();
});

test("resolvePartName keeps a still-valid requested part", () => {
	expect(resolvePartName(["Tune", "Break 1"], "Break 1")).toBe("Break 1");
});

test("resolvePartName falls back to default when the requested part is gone (the crash case)", () => {
	// Reproduces the reported bug: lastPatternName 'Tune' on a tune that has no 'Tune'
	expect(resolvePartName(["Karla Break", "8 up"], "Tune")).toBe("Karla Break");
});

test("resolvePartName falls back to default when requested is undefined", () => {
	expect(resolvePartName(["Tune", "Break 1"], undefined)).toBe("Tune");
});

test("listParts maps keys to localized labels, preferring a pattern's displayName", () => {
	const tune = {
		patterns: {
			"Tune": {},
			"Break 1": {},
			"Call Break Oi": { displayName: "Oi Break" },
		},
	};
	// inject an identity localizer so the test doesn't depend on i18n setup
	expect(listParts(tune, (n) => n)).toEqual([
		{ key: "Tune", label: "Tune" },
		{ key: "Break 1", label: "Break 1" },
		{ key: "Call Break Oi", label: "Oi Break" },
	]);
});

test("listParts returns [] for an undefined tune", () => {
	expect(listParts(undefined, (n) => n)).toEqual([]);
});

test("listParts treats an empty displayName as absent and uses the key", () => {
	const tune = { patterns: { "Break 1": { displayName: "" } } };
	expect(listParts(tune, (n) => n)).toEqual([{ key: "Break 1", label: "Break 1" }]);
});
