import { Category, categoryValidator, instrumentValidator } from "../config";
import { normalizePattern, PatternOptional, patternValidator } from "./pattern";
import * as v from "valibot";

export type ExampleSong = v.InferOutput<typeof exampleSongValidator>;
export const exampleSongValidator = v.array(v.union([v.string(), v.object({
	tuneName: v.optional(v.string()),
	patternName: v.string(),
	length: v.optional(v.number()),
	instruments: v.optional(v.array(instrumentValidator))
})]));

export type Tune = v.InferOutput<typeof tuneValidator>;
export const tuneValidator = v.optional(v.object({
	patterns: v.optional(v.record(v.string(), patternValidator), () => ({})),
	categories: v.optional(v.array(categoryValidator), () => []),
	displayName: v.optional(v.string()),
	sheet: v.optional(v.string()),
	video: v.optional(v.string()),
	descriptionFilename: v.optional(v.string()),
	speed: v.optional(v.number()),
	exampleSong: v.optional(exampleSongValidator)
}), () => ({}));

export function normalizeTune(data?: v.InferInput<typeof tuneValidator>): Tune {
	return v.parse(tuneValidator, data);
}

export function extendTune(tune: Tune, data: Partial<Tune>, selectPattern?: (patternName: string) => boolean): void {
	if(data?.patterns) {
		for(let patternName in data.patterns) {
			if(selectPattern && !selectPattern(patternName))
				continue;

			tune.patterns[patternName] = normalizePattern(data.patterns[patternName]);
		}
	}
}

export function getTuneLength(tune: Tune): number {
	return Object.keys(tune.patterns).length;
}

export function createPatternInTune(tune: Tune, patternName: string, data?: PatternOptional): void {
	tune.patterns[patternName] = normalizePattern(data);
}

export function renamePatternInTune(tune: Tune, patternName: string, newPatternName: string): void {
	if (newPatternName != patternName) {
		tune.patterns[newPatternName] = tune.patterns[patternName];
		delete tune.patterns[patternName];
	}
}

export function removePatternFromTune(tune: Tune, patternName: string): void {
	delete tune.patterns[patternName];
}

export function tuneIsInCategory(tune: Tune, category: Category): boolean {
	if(category == "all")
		return true;
	else if(!tune.categories || tune.categories.length == 0)
		return category == "custom";
	else
		return tune.categories.indexOf(category) != -1;
}
