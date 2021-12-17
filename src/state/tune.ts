import { Category, Instrument } from "../config";
import { normalizePattern, Pattern, PatternOptional } from "./pattern";
import Vue from "vue";

export type ExampleSong = Array<string | { tuneName?: string, patternName: string, length?: number, instruments?: Instrument[] }>;

export type GenericTune<PatternType> = {
	patterns: { [name: string]: PatternType },
	categories: Array<Category>,
	displayName?: string,
	sheet?: string,
	video?: string,
	description?: string,
	speed?: number,
	exampleSong?: ExampleSong
};

export type Tune = GenericTune<Pattern>;

export type TuneOptional = {
	[i in keyof GenericTune<PatternOptional>]?: GenericTune<PatternOptional>[i]
};

export function normalizeTune(data?: TuneOptional): Tune {
	let ret: Tune = Vue.observable({
		patterns: { },
		categories: data && data.categories || [ ],
		displayName: data && data.displayName,
		sheet: data && data.sheet,
		video: data && data.video,
		description: data && data.description,
		speed: data && data.speed,
		exampleSong: data && data.exampleSong
	});

	if (data)
		extendTune(ret, data);

	return ret;
}

export function extendTune(tune: Tune, data: TuneOptional, selectPattern?: (patternName: string) => boolean): void {
	if(data.patterns) {
		for(let patternName in data.patterns) {
			if(selectPattern && !selectPattern(patternName))
				continue;

			Vue.set(tune.patterns, patternName, normalizePattern(data.patterns[patternName]));
		}
	}
}

export function getTuneLength(tune: Tune) {
	return Object.keys(tune.patterns).length;
}

export function createPatternInTune(tune: Tune, patternName: string, data?: PatternOptional): void {
	Vue.set(tune.patterns, patternName, normalizePattern(data));
}

export function renamePatternInTune(tune: Tune, patternName: string, newPatternName: string): void {
	if (newPatternName != patternName) {
		Vue.set(tune.patterns, newPatternName, tune.patterns[patternName]);
		Vue.delete(tune.patterns, patternName);
	}
}

export function removePatternFromTune(tune: Tune, patternName: string): void {
	Vue.delete(tune.patterns, patternName);
}

export function tuneIsInCategory(tune: Tune, category: Category): boolean {
	if(category == "all")
		return true;
	else if(!tune.categories || tune.categories.length == 0)
		return category == "custom";
	else
		return tune.categories.indexOf(category) != -1;
}
