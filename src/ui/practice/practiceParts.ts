import { getLocalizedDisplayName } from "../../services/i18n";

export interface PartOption {
	/** The pattern key within the tune (e.g. "Tune", "Break 1", "Tune (Variant 1)"). */
	key: string;
	/** The localized, user-facing label for the part. */
	label: string;
}

/**
 * The part selected by default for a tune: "Tune" when that pattern exists, otherwise
 * the tune's first pattern. Returns undefined for a tune with no patterns.
 */
export function defaultPartName(patternKeys: string[]): string | undefined {
	return patternKeys.includes("Tune") ? "Tune" : patternKeys[0];
}

/**
 * Resolve a requested part against the tune's available parts: keep it if it still
 * exists, otherwise fall back to the default. This is what prevents a stale pattern
 * name (e.g. "Tune" carried onto a tune that has no "Tune" part) from dangling.
 */
export function resolvePartName(patternKeys: string[], requested: string | undefined): string | undefined {
	return requested && patternKeys.includes(requested) ? requested : defaultPartName(patternKeys);
}

/**
 * Build the ordered list of selectable parts for a tune. Labels prefer a pattern's
 * own `displayName`, then fall back to its key, run through the localizer.
 * `localize` is injectable for testing; it defaults to the app's display-name localizer.
 */
export function listParts(
	tune: { patterns: Record<string, { displayName?: string }> } | undefined,
	localize: (name: string) => string = getLocalizedDisplayName,
): PartOption[] {
	if (!tune) return [];
	return Object.entries(tune.patterns).map(([key, pattern]) => ({
		key,
		label: localize(pattern.displayName || key),
	}));
}
