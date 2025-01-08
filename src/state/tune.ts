import { Category, categoryValidator, instrumentValidator } from "../config";
import { normalizePattern, PatternOptional, patternValidator } from "./pattern";
import * as z from "zod";

export type ExampleSong = z.infer<typeof exampleSongValidator>;
export const exampleSongValidator = z.array(z.string().or(z.object({
	tuneName: z.string().optional(),
	patternName: z.string(),
	length: z.number().optional(),
	instruments: z.array(instrumentValidator).optional()
})));

export type Tune = z.infer<typeof tuneValidator>;
export const tuneValidator = z.object({
	patterns: z.record(z.string(), patternValidator).default(() => ({})),
	categories: z.array(categoryValidator).default(() => []),
	displayName: z.string().optional(),
	sheet: z.string().optional(),
	video: z.string().optional(),
	descriptionFilename: z.string().optional(),
	speed: z.number().optional(),
	exampleSong: exampleSongValidator.optional()
}).default(() => ({}));

export function normalizeTune(data?: z.input<typeof tuneValidator>): Tune {
	return tuneValidator.parse(data);
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
