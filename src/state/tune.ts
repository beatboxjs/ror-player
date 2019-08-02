import { Category } from "../config";
import { normalizePattern, Pattern, PatternOptional } from "./pattern";
import { clone } from "../utils";

export type GenericTune<PatternType> = {
	patterns: { [name: string]: PatternType },
    categories: Array<Category>,
    displayName?: string,
    sheet?: string,
    description?: string,
    speed?: number
};

export type Tune = GenericTune<Pattern>;

export type TuneOptional = {
	[i in keyof GenericTune<PatternOptional>]?: GenericTune<PatternOptional>[i]
};

export function normalizeTune(data?: TuneOptional): Tune {
	let ret: Tune = {
		patterns: { },
		categories: data && data.categories || [ ],
		displayName: data && data.displayName,
		sheet: data && data.sheet,
		description: data && data.description,
		speed: data && data.speed
	};

	if (data)
		ret = extendTune(ret, data);

	return ret;
}

export function extendTune(tune: Tune, data: TuneOptional, selectPattern?: (patternName: string) => boolean): Tune {
	tune = clone(tune);

	if(data.patterns) {
		for(let patternName in data.patterns) {
			if(selectPattern && !selectPattern(patternName))
				continue;

			tune.patterns[patternName] = normalizePattern(data.patterns[patternName]);
		}
	}

	return tune;
}

export function getTuneLength(tune: Tune) {
	return Object.keys(tune.patterns).length;
}

export function createPatternInTune(tune: Tune, patternName: string, data?: PatternOptional): Tune {
	tune = clone(tune);
	tune.patterns[patternName] = normalizePattern(data);
	return tune;
}

export function renamePatternInTune(tune: Tune, patternName: string, newPatternName: string): Tune {
	if (newPatternName != patternName) {
		tune = clone(tune);
		tune.patterns[newPatternName] = tune.patterns[patternName];
		delete tune.patterns[patternName];
	}
	return tune;
}

export function removePatternFromTune(tune: Tune, patternName: string): Tune {
	tune = clone(tune);
	delete tune.patterns[patternName];
	return tune;
}

export function tuneIsInCategory(tune: Tune, category: Category): boolean {
	if(category == "all")
		return true;
	else if(!tune.categories)
		return category == "custom";
	else
		return tune.categories.indexOf(category) != -1;
}
