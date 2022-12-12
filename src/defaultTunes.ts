import config, { Instrument } from "./config";
import { clone, TypedObject } from "./utils";
import { CompressedPattern, LegacyVolumeHack, normalizePattern, Pattern } from "./state/pattern";
import { GenericTune, normalizeTune, Tune } from "./state/tune";
import { PatternReference } from "./state/state";

function stretch(from: number, to: number, pattern: string): string {
	return pattern.split("").concat([""]).join(repeat((to / from) - 1, " "));
}

function repeat(n: number, pattern: string): string {
	let ret = "";
	for (let i = 0; i < n; i++)
		ret += pattern;
	return ret;
}

function crescendo(length: number, start: number = 0): LegacyVolumeHack {
	const r: LegacyVolumeHack = {};
	const a = .05;
	const b = (1 - a) / (length - 1);
	for (let i = 0; i < length; i++)
		r[start + i] = a + b * i;
	return r;
}

function decrescendo(length: number): LegacyVolumeHack {
	const r: LegacyVolumeHack = {};
	const b = 0.95 / (length - 1);
	for (let i = 0; i < length; i++)
		r[i] = 1 - b * i;
	return r;
}

const sheetUrl = "https://github.com/rhythms-of-resistance/sheetbook/blob/master/generated/single/";

type RawTune = { [i in keyof GenericTune<CompressedPattern>]?: GenericTune<CompressedPattern>[i] } & {
	time?: number;
};

const rawTunes: { [tuneName: string]: RawTune } = {
	'General Breaks': {
		categories: ["standard", "common", "uncommon", "new", "proposed", "custom", "onesurdo", "easy", "medium", "tricky", "western", "cultural-appropriation"],
		sheet: sheetUrl + "breaks.pdf",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
		patterns: {
			"Karla Break": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1 }
			},
			"8 up": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: crescendo(32)
			},
			"8 down": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: decrescendo(32)
			},
			"Clave": {
				ls: 'X  X  X   X X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Clave 4x": {
				displayName: "Clave 4× soft to loud",
				ls: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1 }
			},
			'Clave Inverted': {
				ls: '  X X   X  X  X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Progressive': {
				ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Progressive Inverted': {
				ls: 'XXXXXXXXXXXXXXXXX X X X X X X X X   X   X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Progressive Karla': {
				ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXXX               ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'4 Silence': {
				ls: repeat(16, ' ')
			},
			'8 Silence': {
				ls: repeat(32, ' ')
			},
			'12 Silence': {
				ls: repeat(48, ' ')
			},
			'16 Silence': {
				ls: repeat(64, ' ')
			},
			'Boom Break': {
				ls: 'X               ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Yala Break': {
				ls: 'X X   X X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Whistle in": {
				ot: 'y   y   y   y   '
			}
		}
	},
	'Special Breaks': {
		categories: ["standard", "common", "onesurdo"],
		sheet: sheetUrl + "breaks.pdf",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
		patterns: {
			'Hard Core Break': {
				ls: repeat(2, '              XXX             XXX             XXX       XXXXXXXX') + repeat(2, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
				ms: '@ls',
				hs: '@ls',
				re: repeat(1, '              XXX             XXX             XXX       XXXXXXXX') + repeat(3, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
				sn: '@re',
				ta: '@re',
				ag: repeat(3, 'o o o o o o o ooo o o o o o o ooo o o o o o o ooo o o o oooooooo') + repeat(1, 'a a a a a a a aaa a a a a a a aaa a a a a a a aaa a a a aaaaaaaa'),
				sh: '@re',
				volumeHack: {
					ls: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					ms: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					hs: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					re: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					sn: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					ta: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					sh: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 }
				}
			}
		}
	},
	"Afoxe": {
		displayName: "Afoxé",
		categories: ["standard", "common", "medium", "cultural-appropriation"],
		sheet: sheetUrl + "afoxe.pdf",
		description: require("../assets/tuneDescriptions/afoxe.md").default,
		patterns: {
			"Tune": {
				loop: true,
				ls: 's   s   s   s   s   s   X   X   ',
				ms: '0     X 0     X 0     X X X X X ',
				hs: '@ms',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				sn: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				sh: '................................'
			},
			"Break 1": {
				ls: 'X       X       X       X XXXXX ',
				ms: '@ls',
				hs: '@ls',
				re: '   XXXX    XXXX    XXXX X XXXXX ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			"Break 2": {
				ls: 's   s   s   s   s   s   X   X   ',
				ms: '      X       X       X   XXXXX ',
				hs: '@ms',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				sn: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				sh: '................................'
			},
			"Break 3": {
				ls: 's   s   s   s   s   s   X   X   ',
				ms: '   XXXX    XXXX    XXXX X XXXXX ',
				hs: '@ms',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				sn: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				sh: '................................'
			},
			"Bra Break": {
				displayName: "Call Break",
				ls: '        XX XX           XX XX           XX XX   X X X X XX XX X ',
				ms: '@ls',
				hs: '@ls',
				re: 'X X X           X X X           X X X           X X X X XX XX X ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Tamborim Stroke": {
				ls: 'X X X X XX XX X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tamborim Stroke"]
	},
	'Angela Davis': {
		categories: ["standard", "common", "medium"],
		sheet: sheetUrl + "angela-davis.pdf",
		description: require("../assets/tuneDescriptions/angela-davis.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/3a431ae3-e59b-4d31-b2d6-9abc4db3f242",
		patterns: {
			Tune: {
				loop: true,
				ls: 'r r X  XrXr X   ',
				ms: 'XXXXXXXXX       ',
				hs: '            XXXX',
				re: 'f   f   f  XXX  ',
				sn: '....X.......X...',
				ta: 'X   X  XXX  X   ',
				ag: '  o a   oa  a   ',
				sh: '................'
			},
			'Break 1': {
				upbeat: 1,
				ls: 'XX X X X X X X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 2': {
				ls: 'X             X X             X X              XX X X X X X X X ',
				ms: '@ls',
				hs: '@ls',
				re: '  XXX XX XX X     XXX XX XX X     XXX XX XX X  XX X X X X X X X ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 3': {
				ls: 'X     XXXX      X X X  X        X     XXXX        X  X  X      XX X X X X X X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '....X.......X.......X.......X.......X.......X.......X.......X.......X.......X...',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: ["Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Break 3", "Tune", "Tune", "Tune", "Tune"]
	},
	'Bhangra': {
		categories: ["standard", "common", "onesurdo", "medium"],
		speed: 120,
		time: 3,
		displayName: "Bhaṅgṛā",
		sheet: sheetUrl + "bhangra.pdf",
		description: require("../assets/tuneDescriptions/bhangra.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/bb1e9a2e-ce51-435c-818f-d98cf95f9ed0",
		patterns: {
			Tune: {
				loop: true,
				ls: 'X       XX  X       XX  X       XX  X    X   X  ',
				ms: '@ls',
				hs: '@ls',
				re: 'X zX zX zX zX zX zX zX zX zX zX zX zXXXX  XXXX  ',
				sn: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..',
				ta: 'X XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX X',
				ag: 'aaaa  oooo              aaaa  oooo              ',
				sh: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..'
			},
			'Break 1': {
				upbeat: 4,
				ls: 'XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X    X   X              ',
				ms: '@ls',
				hs: '@ls',
				re: '                   X  X                    X  X                    X  X                             ',
				sn: '                   X  X                    X  X                    X  X                 XXXX  XXXX  ',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 2': {
				upbeat: 4,
				ls: 'XX  X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X              ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: 'XX  X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X  XXXX  XXXX  ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Break 3": {
				ls: "XXXX  XXXX  ",
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Bra Break": {
				displayName: "Call Break",
				ls: '                                                                        X XX XX XX              ',
				ms: '@ls',
				hs: '@ls',
				re: 'XXXXXXXXXX              XXXXXXXXXX              XXXX        XXXXXXXXXX              XXXXXXX     ',
				sn: '            XXXXXXXXXX              XXXXXXXXXX        XXXX                          XXXXXXX     ',
				ta: '@sn',
				ag: '@sn',
				sh: '@sn',
				ot: '                                                                                             F  '
			},
			"Karla Break (3⁄4)": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: { 0: .1, 12: .4, 24: .7, 36: 1 }
			},
			"8 up (3⁄4)": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: crescendo(24)
			},
			"8 down (3⁄4)": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: decrescendo(24)
			},
			'Progressive (3⁄4)': {
				ls: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Progressive Inverted (3⁄4)': {
				ls: 'XXXXXXXXXXXXX XX XX XX XX  X  X  X  ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Progressive Karla (3⁄4)': {
				ls: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXXX           ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: ["Tune", "Break 1", "Tune", "Break 2", "Tune", "Break 3", "Tune", "Bra Break", "Tune"]
	},
	'Custard': {
		categories: ["standard", "common", "medium", "cultural-appropriation"],
		sheet: sheetUrl + "custard.pdf",
		description: require("../assets/tuneDescriptions/custard.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '0   X   0   X X ',
				ms: 'X   0   X   0   ',
				hs: 'X X 0   XX X0   ',
				re: '  XX  XX  XX  XX',
				sn: 'X.X.X..X.X..X...',
				ta: 'X X XX X X X XX ',
				ag: 'a a oo a a o oo ',
				sh: '................'
			},
			'Break 1': {
				ls: repeat(3, 'X X XX          ') + 'X X XX X X X XX ',
				ms: '@ls',
				hs: '@ls',
				re: repeat(3, '       X X X XX ') + 'X X XX X X X XX ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 2': {
				ls: repeat(3, '       X X X XX ') + 'X X XX X X X XX ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@re',
				ta: repeat(3, 'X X XX          ') + 'X X XX X X X XX ',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 3': {
				ls: repeat(4, 'X             X X               '),
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: repeat(3, 'X             X X               ') + 'X             X X.X.X..X.X..XXXX',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 3 (Agogô continues)': {
				ls: repeat(4, 'X             X X               '),
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: repeat(3, 'X             X X               ') + 'X             X X.X.X..X.X..XXXX',
				ta: '@ls',
				ag: repeat(8, 'a a oo a a o oo '),
				sh: '@ls'
			},
			'Break 5': {
				ls: '              X X             X X     X X     X X   X   X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: 'X.X.X..X.X..X     X.X..X.X..X     X X     X X     X   X   X   X ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Singing Break': {
				ot: '4 3 21 C H I M# '
			}
		},
		exampleSong: ["Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3 (Agogô continues)", "Tune", "Tune", "Tune", "Tune", "Break 5", "Tune", "Tune", "Tune", "Tune", "Singing Break"]
	},
	'Drum&Bass': {
		categories: ["standard", "common", "medium", "western"],
		sheet: sheetUrl + "drum-bass.pdf",
		description: require("../assets/tuneDescriptions/drum-bass.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/f5331b5e-5de7-41e9-af0f-813f874bb074",
		patterns: {
			Tune: {
				loop: true,
				ls: 'X         X  X  X         X     X         X  X  X         X     ',
				ms: '      XXXX            XXXX            XXXX            XXXX      ',
				hs: '    X       X       X       X       X       X       X       X   ',
				re: '    X  X X XX XX    X       X       X  X X XX XX    X       X   ',
				sn: '....X..X....X.......X..X....X   ....X..X....X...X.X.X.X.X.X.X.X.',
				ta: '    X     X X       X   X X X       X     X X       X   X X X   ',
				ag: 'o ao ao a       o ao ao a       o ao ao a       o ao ao a       ',
				sh: '................................................................'
			},
			'Break 1': {
				displayName: 'Dance Break',
				time: 2,
				ot: 'TUVWY Z '
			},
			'Break 2': {
				ls: 'X  X X  X  X X  X  X X          ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X   X   X   X   X XXXX    ',
				sn: '@re',
				ta: '  X   X   X   X   X   X         ',
				ag: '@ta',
				sh: '@ta'
			},
			'Break 3': {
				ls: 'X     X   X  X  X     X   X  X  X     X   X  X  ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Hip-Hop Break': {
				ls: 'X  X     X X    X  X   X X X  X X  X     X X                    X  X     X X    X  X   X X X  X X  X     X X                    ',
				ms: '@ls',
				hs: '@ls',
				re: '    X       X       X       X       X       X   Xr Xr Xr Xr XXrr    X       X       X       X       X       X                   ',
				sn: '    X       X       X       X       X       X                       X       X       X       X       X       X     X   X   X   X ',
				ta: '    X       X       X       X       X       X                       X       X       X       X       X       X                   ',
				ag: '@ta',
				sh: '@ta'
			}
		},
		exampleSong: ["Tune", "Break 2", "Tune", "Break 3", "Break 1", "Tune", "Hip-Hop Break", "Tune"]
	},
	'Funk': {
		categories: ["standard", "common", "onesurdo", "easy"],
		sheet: sheetUrl + "funk.pdf",
		description: require("../assets/tuneDescriptions/funk.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'X  X  X X X     X  X  X X       ',
				ms: '@ls',
				hs: '@ls',
				re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
				sn: '....X.......X.......X.......X...',
				ta: '    X       X X     X     X X   ',
				ag: 'o  a  o   a a a o  a  o   a a a ',
				sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			"Break 1": {
				ls: 'X X     X X   X X X     X       X X     X X   X X X     X       ',
				ms: '@ls',
				hs: '@ls',
				re: '    X X     X       X X   X   X     X X     X       X X   XXX   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			"Break 2": {
				ls: 'X X X X X X X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: 'o o o o o o o o ',
				sh: '@ls'
			},
			"Tune (Variant 1)": {
				ls: 'X       X X   X X       X       ',
				ms: '@ls',
				hs: '@ls',
				re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
				sn: '....X.......X.......X.......X...',
				ta: '    X       X X   XXX   X X X   ',
				ag: 'o  a  o   a a a o  a  o   a a a ',
				sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			"Tune (Variant 2)": {
				ls: 'X X     X X   X X X     X       ',
				ms: '@ls',
				hs: '@ls',
				re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
				sn: '....X.......X.......X.......X...',
				ta: '    X       X X     X     X X   ',
				ag: 'o  a  o   a a a o  a  o   a a a ',
				sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			}
		},
		exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune"]
	},
	'Hedgehog': {
		categories: ["standard", "uncommon", "easy"],
		sheet: sheetUrl + "hedgehog.pdf",
		description: require("../assets/tuneDescriptions/hedgehog.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 's  X    s  X    s  X    X X X X ',
				ms: '      XX      XX      XX      XX',
				hs: '   X  X    X  X    X  X   X   X ',
				re: 'r  X  X r  X  X r  X  X r X r X ',
				sn: 'X..X..X.X..X..X.X..X..X.X...X...',
				ta: 'X  X    X  X    X  X    X X X   ',
				ag: 'o  a  a o  a  a o  a  a o a o a ',
				sh: '................................'
			},
			'Break 1': {
				ls: 'X   X   X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: 'r  X  X r X r X ',
				sn: 'X..X..X.X...X...',
				ta: 'X  X    X X X   ',
				ag: 'o  a  a o a o a ',
				sh: 'XXXXXXXXXXXXXXXX'
			},
			'Break 2': {
				ls: 'X               ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				ot: '        R   S   '
			}
		},
		exampleSong: ["Tune", "Tune", "Break 2", "Tune", "Tune"]
	},
	'Karla': {
		categories: ["standard", "common", "onesurdo", "easy"],
		sheet: sheetUrl + "karla-shnikov.pdf",
		description: require("../assets/tuneDescriptions/karla-shnikov.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/cc4d0222-3713-4943-bba1-cc733cb84ccc",
		patterns: {
			Tune: {
				loop: true,
				ls: 'X   0 XX    0   X   0 XX    0   X   0 XX    0   X   0 XX X XX X ',
				ms: '@ls',
				hs: '@ls',
				re: 'X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X ',
				sn: '....X.......X.......X.......X.......X.......X.......X.......X...',
				ta: '    X       X       X  X X XX       X       X       X  X X XX   ',
				ag: 'o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o ',
				sh: '................................................................'
			},
			'Break 2': {
				ls: 'XXXXXXXXXXXXXXXXX   X   X   X   X X    X X      X X    X X      ',
				ms: '@ls',
				hs: '@ls',
				re: 'XXXXXXXXXXXXXXXXX   X   X   X       X      XXXX     X      XXXX ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 2 Inverted': {
				ls: 'XXXXXXXXXXXXXXXXX   X   X   X   X X    X X      X X    X X      X X    X X      X X    X X      X   X   X   X   XXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: 'XXXXXXXXXXXXXXXXX   X   X   X       X      XXXX     X      XXXX     X      XXXX     X      XXXX X   X   X   X   XXXXXXXXXXXXXXXX',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: ["Tune", "Break 2", "Tune", "Break 2 Inverted", "Tune"]
	},
	'Samba Reggae': {
		categories: ["standard", "common", "medium", "cultural-appropriation"],
		sheet: sheetUrl + "samba-reggae.pdf",
		description: require("../assets/tuneDescriptions/samba-reggae.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '0   X   0   X X ',
				ms: 'X   0   X   0   ',
				hs: '0     X 0   XXXX',
				re: '  XX  XX  XX  XX',
				sn: 'X..X..X...X..X..',
				ta: 'X  X  X   X X   ',
				ag: 'o a a oo a aa o ',
				sh: '................'
			},
			'Bra Break': {
				displayName: "Call Break",
				ls: '          X X             X X             X X                                                                 X ',
				ms: '          X X             X X             X X                                                                   ',
				hs: '@ms',
				re: 'f XX XX X       f XX XX X       f XX XX X                                                                       ',
				sn: '          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...',
				ta: '          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
				ag: '@ms',
				sh: '@ms'
			},
			'Break 1': {
				ls: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ',
				ms: '@ls',
				hs: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX',
				re: 'XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ',
				sn: '                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 2': {
				ls: '            XXXX            XXXX            XXXX            XXXX',
				ms: '@ls',
				hs: '@ls',
				re: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 3': {
				ls: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ',
				ms: '@ls',
				hs: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX',
				re: '                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ',
				sn: 'X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...',
				ta: '                                X  X  X   X                     X  X  X   X                 X X             X X                 ',
				ag: '                                X  X  X   X                     X  X  X   X                 a a             a a                 ',
				sh: '                                X  X  X   X                     X  X  X   X                                                     '
			},
			'SOS Break': {
				ls: 'X       X       X       X       X       X       X       X     X ',
				ms: 'X       X       X       X       X       X       X       X       ',
				hs: '@ms',
				re: '  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Knock On The Door Break': {
				time: 12,
				ls: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Knock On The Door (Cut)': {
				time: 12,
				ls: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
				ms: '@ls',
				hs: '@ls',
				re: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X X XX X X X XX '),
				sn: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Dancing Break': {
				ls: repeat(3, 'X  X   XX   X                   ') + 'X  X   XX   X                 X ',
				ms: repeat(4, 'X  X   XX   X                   '),
				hs: '@ls',
				re: repeat(4, '                X  X   XX   X   '),
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: ["Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune", "Tune", "Tune", "Tune", "Knock On The Door Break", "Knock On The Door (Cut)", "Tune", "Tune", "Tune", "Tune", "Dancing Break", "Tune", "Tune", "Tune", "Tune"]
	},
	'Sambasso': {
		categories: ["standard", "common", "onesurdo", "tricky"],
		sheet: sheetUrl + "sambasso.pdf",
		description: require("../assets/tuneDescriptions/sambasso.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/f75a6a4e-121a-4170-aaf4-2e96a7eed95e",
		patterns: {
			Tune: {
				loop: true,
				ls: 'X  tX t X  tX t X  tX t X  tX t ',
				ms: '@ls',
				hs: '@ls',
				re: 'X..X..X..XX..XX.X..X..X..XX..XX.',
				sn: 'X..X..X...X..X..X..X..X...X..X..',
				ta: ' X XX X XX XX  X X XXXX X  XX   ',
				ag: 'o  aa oo a oo a o  aa oo a oo a ',
				sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			'Break 1': {
				ls: 'X  tX t XX XX   ',
				ms: '@ls',
				hs: '@ls',
				re: 'X..X..X.XX XX   ',
				sn: 'X..X..X.XX XX   ',
				ta: ' X XX X XX XX   ',
				ag: 'o  aa ooXX XX   ',
				sh: 'X X X X XX XX   ',
				ot: 'y w w           '
			},
			'Break 2': {
				ls: repeat(4, 'X X X X X       '),
				ms: '@ls',
				hs: '@ls',
				re: repeat(4, '          XX XX '),
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1 }
			},
			'Intro': {
				upbeat: 1,
				ls: '         XX XX           XX XX           XX XX           XX XX                       X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   ',
				ms: '@ls',
				hs: '@ls',
				re: 'fX X X          fX X X          fX X X          fX X X           X..X..X..X..ffffX                               X..X..X..X..ffffX                               X..X..X..X..ffffX                               X..X..X..X..ffffX                               ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: ["Intro", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune"]
	},
	"Stolen ": {
		categories: ["standard", "common", "tricky"],
		sheet: undefined,
		description: require("../assets/tuneDescriptions/stolen.md").default,
		video: undefined,
		patterns: {
			Tune: {
				"ls": " X  X  X  X  X  X  X  X  X                       X  X  X  X  X  X  X  X  X                       X  X  X  X  X  X  X  X  X                       X  X  X  X  X  X  X  X  X",
				"ms": "@ls",
				"hs": " X           X           X        X  X     X     X           X           X        X  X     X     X           X           X        X  X     X     X           X           X        X  X     X",
				"re": " .  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .  X  .  .  X  .  .  X  .  X  .  .  X  .  .  X  .",
				"sn": " .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
				"ta": " X        X        X     X        X        X  X  X        X        X     X        X        X  X  X        X        X     X        X        X  X  X        X        X     X        X        X  X",
				"ag": " o     a  o     a  o     o     a  o  o     a     o     a  o     a  o     o  a  a  o  o     a     o     a  o     a  o     o     a  o  o     a     o     a  o     a  o     o  a  a  o  o     a",
				"sh": "@sn",
				"time": 12,
				"length": 16
			},
			"Break 1": {
				"ls": "                                           X                                               X                                               X                                               X           X                 X                 X",
				"ms": "@ls",
				"hs": "@ls",
				"re": " X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X           XXX               XXX               XXX",
				"sn": " .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
				"ta": "@ls",
				"ag": "                                           o                                               o                                               o                                               o           o                 o                 o",
				"time": 12,
				"length": 20
			},
			"Intro": {
				"ls": "                                           X",
				"ms": "@ls",
				"hs": "@ls",
				"re": "zX  X     X     X     X     XX X  X  X",
				"sn": "                                                 .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
				"ta": "@ls",
				"ag": "                                           o",
				"time": 12,
				"length": 20
			},
			"Outro": {
				"ls": " X",
				"ms": " X",
				"hs": " X",
				"re": " X",
				"sn": " X",
				"ta": " X",
				"ag": " o",
				"time": 12,
				"length": 4
			}
		},
		exampleSong: ["Intro", "Break 1", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 1", "Outro"]
	}
};

const defaultTunes: { [tuneName: string]: Tune } = {};

for (const i in rawTunes) {
	const tune = rawTunes[i];
	const newTune = clone(tune) as any as Tune;

	for (const j in tune.patterns) {
		const pattern = tune.patterns[j];
		const newPattern = clone(pattern) as any as Pattern;
		if (!newPattern.time && tune.time)
			newPattern.time = tune.time;

		for (const k of config.instrumentKeys) {
			const thisPattern = pattern[k] = pattern[k] || "";
			const m = thisPattern.match(/^@([a-z]{2})$/);
			if (m)
				newPattern[k] = clone(newPattern[m[1] as Instrument]);
			else {
				newPattern[k] = thisPattern.split('');
				newPattern.length = Math.max(newPattern.length || 0, newPattern[k].length - (pattern.upbeat || 0));
			}

			if (k == "ag")
				newPattern[k] = newPattern[k].map(function (it) { return it == "X" ? "o" : it; });
		}

		newPattern.length = Math.ceil(newPattern.length / (newPattern.time || 4));
		if (newPattern.length % 4)
			console.error(`Unusual length ${newPattern.length} for ${j} of ${i}.`);

		newTune.patterns[j] = normalizePattern(newPattern);
	}

	defaultTunes[i] = normalizeTune(newTune);

	const unknown = (defaultTunes[i].exampleSong || []).filter((patternName) => !defaultTunes[i].patterns[typeof patternName === 'string' ? patternName : patternName.patternName]);
	if (unknown.length > 0)
		console.error(`Unknown breaks in example song for ${i}: ${unknown.join(", ")}`);
}

Object.defineProperty(defaultTunes, "getPattern", {
	configurable: true,
	value: function (tuneName: string | PatternReference, patternName?: string): Pattern | null {
		if (Array.isArray(tuneName)) {
			patternName = tuneName[1];
			tuneName = tuneName[0];
		}

		return this[tuneName] && this[tuneName].patterns[<string>patternName] || null;
	}
});

Object.defineProperty(defaultTunes, "firstInSorting", {
	configurable: true,
	value: ["General Breaks", "Special Breaks", "Shouting Breaks"]
});

interface DefaultTunesMethods {
	getPattern(tuneName: string, patternName?: string): Pattern | null,
	getPattern(patternReference: PatternReference): Pattern | null,
	firstInSorting: Array<string>
}

type DefaultTunes = TypedObject<Tune> & DefaultTunesMethods;

export default <DefaultTunes>defaultTunes;
