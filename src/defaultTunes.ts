import config, { Instrument } from "./config";
import { clone, TypedObject } from "./utils";
import { CompressedPattern, LegacyVolumeHack, normalizePattern, Pattern } from "./state/pattern";
import { GenericTune, normalizeTune, Tune } from "./state/tune";
import { PatternReference } from "./state/state";

function stretch(from: number, to: number, pattern: string): string {
	return pattern.split("").concat([ "" ]).join(repeat((to/from)-1, " "));
}

function repeat(n: number, pattern: string): string {
	let ret = "";
	for(let i=0; i<n; i++)
		ret += pattern;
	return ret;
}

function crescendo(length: number, start: number = 0): LegacyVolumeHack {
	const r: LegacyVolumeHack = { };
	const a = .05;
	const b = (1-a)/(length-1);
	for(let i=0; i<length; i++)
		r[start+i] = a+b*i;
	return r;
}

function decrescendo(length: number): LegacyVolumeHack {
	const r: LegacyVolumeHack = { };
	const b = 0.95/(length-1);
	for(let i=0; i<length; i++)
		r[i] = 1-b*i;
	return r;
}

const sheetUrl = "https://github.com/rhythms-of-resistance/sheetbook/blob/master/generated/single/";

type RawTune = { [i in keyof GenericTune<CompressedPattern>]?: GenericTune<CompressedPattern>[i] } & {
	time?: number;
};

const rawTunes: {[tuneName: string]: RawTune} = {
	'General Breaks': {
		categories: [ "standard", "common", "uncommon", "new", "proposed", "custom", "onesurdo", "easy", "medium", "tricky", "western", "cultural-appropriation" ],
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
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
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
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
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
		categories: [ "standard", "common", "onesurdo" ],
		sheet: sheetUrl + "breaks.pdf",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
		patterns: {
			"Call Break Oi": {
				displayName: 'Oi Break',
				time: 3,
				ls: 'X  XXXX     ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: '         A  '
			},
			"Call Break Ua": {
				displayName: 'Ua Break',
				time: 3,
				ls: 'X  XXXX     ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: '         B  '
			},
			'Star Wars': {
				ls: '            X       X           ',
				ms: 'X   X   X       X       X       ',
				hs: '               X       X        '
			},
			'Star Wars Extended': {
				ls: '            X       X                               X           ',
				ms: 'X   X   X       X       X                       X       X       ',
				hs: '               X       X                       X       X        ',
				re: '                                X   X   X                       ',
				ta: '                                            X                   '
			},
			'Star Wars Extended Extended': {
				ls: '            X       X                               X                                                 X     X       X           ',
				ms: 'X   X   X       X       X                       X       X           X  X              X                         X       X       ',
				hs: '               X       X                       X       X                                                       X       X        ',
				re: '                                X   X   X                                                                                       ',
				sn: '@re',
				ta: '                                            X                                                   XXX     X                       ',
				ag: '                                                                a       a   a  aooo     o   o  o                                '
			},
			"Wulf Break": {
				ls: 'X X   XXX X    XX X    XX X     X X   XXX X    XX X X X X       ',
				ms: '@ls',
				hs: '@ls',
				re: '    X       X       X       X       X       X  XX X X X X       ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re',
				ot: '                                                          E D   '
			},
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
					ls: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					ms: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					hs: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					re: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					sn: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					ta: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					sh: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 }
				}
			},
			'Nellie the Elephant Break': {
				ls: '            X X             X X             X X XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ' + repeat(2, '                ') + repeat(3, 'X  X  X         ') + 'X           XXX ',
				ms: '@ls',
				hs: '@ls',
				re: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ' + repeat(2, '                ') + repeat(3, '        X  X  X ') + 'X           XXX ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: '                                                                                                ' + repeat(2, 'DDDDDDDDDDDDDDDD') + repeat(3, '                ') + '                ',
				volumeHack: Object.assign({ 48: .2, 64: .6, 80: 1, 128: .2, 144: .6, 160: 1 }, crescendo(32, 96))
			},
			'Super Mario Break': {
				ls: '     X          ',
				ms: 'XX X  X         ',
				hs: '        X       ',
				ag: '            o   '
			},
			'Punky Monkey Break': {
				ot: 'DDEEDDEEA A A   '
			}
		}
	},
	"Shouting Breaks": {
		categories: [ "standard", "common", "onesurdo" ],
		sheet: sheetUrl + "breaks.pdf",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
		patterns: {
			"Democracy Break": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                X X X XX XX X X                 X X X XX XX X X                                                 X  X  X   X X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				ot: '                                                * , - ?: ;< = >                 * , - ?: ;< = >                 * , - ?: ;< = > * , - ?: ;< = > * , - ?: ;< = >                 ',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1, 112: .4, 128: .7, 144: 1 }
			},
			'Tout le monde': {
				ls: 'X     X X     X X  XX X X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: 'b     c d     e g  qj k m   n   '
			},
			'Dance Break': {
				time: 2,
				ot: 'TUVWY Z '
			},
			'Wir sind hier': {
				time: 2,
				ls: "     XX      XX              XX ",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls",
				ot: "K [\\    K [^    _ ` { | }~ À    "
			},
			'Keep it in the ground': {
				ls: "                          X X   ",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls",
				ot: "Á   Â   Ã ÄÅ ÆÇ Á Â Ã ÄÅ        "
			},
			'Keine Profite mit der Miete': {
				time: 4,
				ls: "                X XXX X X X X X ",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls",
				ot: "È ÉÊË Ì Í Î Ï Ì                 "
			}
		}
	},
	"Afoxe": {
		displayName: "Afoxé",
		categories: [ "standard", "common", "medium", "cultural-appropriation" ],
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
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tamborim Stroke"]
	},
	'Angela Davis': {
		categories: [ "standard", "common", "medium" ],
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
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Break 3", "Tune", "Tune", "Tune", "Tune"]
	},
	'Angry Dwarfs': {
		categories: [ "uncommon" ],
		sheet: sheetUrl + "angry-dwarfs.pdf",
		description: require("../assets/tuneDescriptions/angry-dwarfs.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 's   X   s   X   ',
				ms: 'X  XX  XX  XX X ',
				hs: '@ms',
				re: '  f  f    f  f  ',
				sn: '..XX..X...XX..X.',
				ta: '  X   X   X X X ',
				ag: 'a  ao  ao a a   ',
				sh: 'X..XX..XX..XX..X'
			},
			'Intro': {
				ls: repeat(4, '                ') + repeat(3, '        XX XX X ') + '    X       X   ',
				ms: repeat(4, '                ') + repeat(3, '        XX XX X ') + 'X       X   X X ',
				hs: repeat(4, '                ') + repeat(3, '        XX XX X ') + '            X X ',
				re: repeat(4, '                ') + repeat(3, 'XX XX X         ') + '  X   X   X X X ',
				sn: repeat(4, '                ') + repeat(3, '        XX XX X ') + '                ',
				ta: repeat(8, '  X   X   X X X '),
				ag: '@sn',
				sh: '@sn'
			},
			'No-Cent-For-Axel-Break': {
				ls: '        XX XX X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: '98 76 5         '
			},
			'Tension Break': {
				ls: '    X       X       X   XX XX X ',
				ms: '  X   X   X   X   X   X XX XX X ',
				hs: '                        XX XX X ',
				re: '@hs',
				ta: 'XX XX X         XX XX X XX XX X ',
				ag: '@hs',
				sh: '@hs'
			}
		},
		exampleSong: [ "Intro", "Tune", "Tune", "Tune", "Tune", "No-Cent-For-Axel-Break", "Tune", "Tune", "Tune", "Tune", "Tension Break", "Tune", "Tune", "Tune", "Tune" ]
	},
	'Bhangra': {
		categories: [ "standard", "common", "onesurdo", "medium" ],
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
				volumeHack: { 0: .1, 12: .4, 24: .7, 36: 1  }
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
		exampleSong: [ "Tune", "Break 1", "Tune", "Break 2", "Tune", "Break 3", "Tune", "Bra Break", "Tune" ]
	},
	'Cochabamba' : {
		categories: [ "standard", "uncommon", "tricky" ],
		sheet: sheetUrl + "cochabamba.pdf",
		description: require("../assets/tuneDescriptions/cochabamba.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'XX  0    XX 0   XX  0    XX 0   ',
				ms: '@ls',
				hs: '    0 XX    0 XX    0 XX    0 XX',
				re: '  XX  X   XX  X   XX  XX  XX  X ',
				sn: '....X.......X.......X.......X...',
				ta: '@re',
				ag: 'aa.oo.aa.oo.a.a.oo.aa.oo.aa.o.o.',
				sh: '................................'
			},
			'Break 1': {
				ls: 'XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: { 0: .2, 16: .6, 32: 1  }
			},
			'Bra Break (Maestra)': {
				displayName: "Call Break (Maestra)",
				ls: '            X X             X X             X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: 'ww ww ww ww     ww ww ww ww     ww ww ww ww     '
			},
			'Bra Break (Repi)': {
				displayName: "Call Break (Repi)",
				ls: '            X X             X X             X X ',
				ms: '@ls',
				hs: '@ls',
				re: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Bra Break (Snare)': {
				displayName: "Call Break (Snare)",
				ls: '            X X             X X             X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Cross Kicks': {
				ls: 'XX  0       0   ',
				hs: '    0       0 XX'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break (Repi)", "Tune", "Tune", "Cross Kicks", "Tune", "Tune" ]
	},
	'Coupe-Decale': {
		displayName: "Coupé-Décalé",
		categories: [ "proposed" ],
		sheet: sheetUrl + "coupe-decale.pdf",
		description: require("../assets/tuneDescriptions/coupe-decale.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: "X       X X     X       X X     X       X X     X       XXXX    ",
				ms: "   X  X     X  X   X  X     X  X   X  X     X  X   X  X     XXXX",
				hs: "@ms",
				re: "X..X..XX..X.X...X..X..XX..X.X...X..X..XX..X.X...X..X..XX..X.X...",
				sn: "@re",
				ta: "X  X      f X   X  X            X  X      f X   X  X    XXXX    ",
				ag: "o  a            o  a  a o o a  ao  a            o  a  a o o a  a",
				sh: "X..X..X...X.X.X.X..X..X.........X..X..X...X.X.X.X..X..X.XXXXXXXX"
			},
			"Break 1": {
				ls: "X   X   X   X   X   X   X                 X",
				ms: "@ls",
				hs: "@ls",
				re: "X   X   X   X   X   X   X     f     X     X",
				sn: "@ls",
				ta: "@ls",
				ag: "a   a   a   a   a   a   a                  ",
				sh: "@ls",
				time: 12
			},
			"Break 2": {
				ls: "                                          X                                               X                                               X     X   X   X   X   X   X   X                 X",
				ms: "@ls",
				hs: "@ls",
				re: "X        X                          X           X        X                          X           X        X                          X           X   X   X   X   X   X   X     f     X     X",
				sn: "@re",
				ta: "@re",
				ag: "a        a                          a           a        a                          a           a        a                          a           a   a   a   a   a   a   a                  ",
				sh: "@re",
				time: 12
			},
			"Intro": {
				ls: "                                                                                                                                                                                                                                                        XXXX    ",
				ms: "                                                                                                                                                                                                                                                            XXXX",
				re: "r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   ",
				sn: "@re",
				ta: "                                                                                                                                X  X      f X   X  X            X  X      f X   X  X            X  X      f X   X  X            X  X      f X   X  X            ",
				ag: "                                                                o  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  a",
				sh: "                                                                                                                                                                                                X..X..X...X.X.X.X..X..X.........X..X..X...X.X.X.X..X..X.XXXXXXXX"
			},
			"Tune (6/8)": {
				loop: true,
				ls: "X     XX    X     XX",
				ms: "  X XX   X X  X XX   X X",
				hs: "@ms",
				re: "X.X.XX.X.X..X.X.XX.X.X..",
				sn: "@re",
				ta: "X X X  f X  f X X    X X",
				ag: "o a aaoo a ao a aaoo a a",
				sh: "X..X..X..X..X..X..X..X..",
				time: 3
			},
			"Intro (6/8)": {
				ls: "                                    XXX XXX XXX",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "o a aaoo a ao a aaoo a ao a aaoo a a           ",
				sh: "@ls",
				time: 3
			},
			"Crest Break (6/8)": {
				ls: "    XX    XX          XX    XX    XX          XX            XXX XXX XXX",
				ms: "@ls",
				hs: "@ls",
				re: "XXXX  XXXX  XXXXXXXXXX  XXXX  XXXX  XXXXXXXXXX  X X XX X X X           ",
				sn: "@ls",
				ta: "@ls",
				ag: "    aa    oo          aa    oo    aa          oo            aaa ooo ooa",
				sh: "@ls",
				time: 3
			}
		},
		exampleSong: [ "Intro", "Tune", "Break 1", "Tune", "Break 2", "Intro (6/8)", "Tune (6/8)", "Crest Break (6/8)", "Tune (6/8)", "Break 2", "Tune", "Break 1" ]
	},
	'Crazy Monkey': {
		categories: [ "standard", "uncommon", "tricky" ],
		sheet: sheetUrl + "crazy-monkey.pdf",
		description: require("../assets/tuneDescriptions/crazy-monkey.md").default,
		patterns: {
			Tune: {
				loop: true,
				time: 12,
				ls: 'X                       X                       X                       X     X  X              ',
				ms: '                  X                       X                       X     X     X  X        X     ',
				hs: '         X  X  X  X  X           X  X  X  X  X           X  X  X  X  X  X     X  X              ',
				re: 'f        h  X     X  X  f        h  X     X  X  f        h  X     X  X  X     X  X              ',
				sn: '.  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  X  .  X  X  .  .        ',
				ta: '      X  X        X        X     X        X           X  X        X        X     X              ',
				ag: 'o     a  a  a     o  o     a     a  a     o  o  o     a  a  a     o  o      a   a   a   a   a   ',
				sh: 'X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X     X  X              '
			},
			"Break 1": {
				ls: '        X XX            X XX          X X     X X   X   X XX    ',
				ms: '        X XX            X XX          X X     X X   X   X XX  X ',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: 'o aaa oo      o o aaa oo      o o aaa   o aaa   o aao aao       ',
				sh: '@ls'
			},
			"Break 2": {
				ls: '        X XX            X XX        X XX    X XX        X XX    ',
				ms: '        X XX            X XX        X XX    X XX        X XX  X ',
				hs: '@ls',
				re: '@ls',
				sn: '....X.XXX.XX........X.XXX.XX........X.XX....X.XX....X.XXX.XX    ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Break 3": {
				ls: 'X XX    X XX    X XXX XXX XX    ',
				ms: 'X XX    X XX    X XXX XXX XX  X ',
				hs: '@ls',
				re: '      X       X X XXX XXX XX    ',
				sn: '@re',
				ta: '@re',
				ag: '      X       X o aoo aoo oo  a ',
				sh: '@re'
			},
			"Bongo Break 1": {
				loop: true,
				ls: 'X   X   X   X   X   X   X XX    ',
				ms: '@ls',
				hs: '@ls',
				re: '   X  X  X X  X    X  X       X ',
				sn: '@re',
				ta: '@re',
				ag: 'o  ao a oa ao a o  ao a o oo  a ',
				sh: '@re'
			},
			"Bongo Break 2": {
				loop: true,
				ls: 'X   X   X   X   X   X   X XX  X ',
				ms: '@ls',
				hs: '@ls',
				re: 'X XX XX X XX XX X XX XX       X ',
				ta: '@re',
				ag: 'o  ao a oa ao a o  ao a o oo  a ',
				sh: '@re'
			},
			"Monkey Break": {
				ot: '(  (  ( )  )  ) '
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Bongo Break 1", "Bongo Break 1", "Bongo Break 2", "Bongo Break 2", "Monkey Break", "Tune", "Tune"]
	},
	'Custard': {
		categories: [ "standard", "common", "medium", "cultural-appropriation" ],
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
			'Break 3' : {
				ls: repeat(4, 'X             X X               '),
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: repeat(3, 'X             X X               ') + 'X             X X.X.X..X.X..XXXX',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 3 (Agogô continues)' : {
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
		categories: [ "standard", "common", "medium", "western" ],
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
		exampleSong: [ "Tune", "Break 2", "Tune", "Break 3", "Break 1", "Tune", "Hip-Hop Break", "Tune" ]
	},
	'Drunken Sailor': {
		categories: [ "standard", "uncommon", "medium", "western" ],
		sheet: sheetUrl + "drunken-sailor.pdf",
		description: require("../assets/tuneDescriptions/drunken-sailor.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/00dd3ac1-a872-49ea-aec1-8c8ebc8f334e",
		patterns: {
			Tune: {
				loop: true,
				ls: 'X   X   X X     X   X   X X     X   X   X X             X   X   ',
				ms: 'X   X   X   X   X   X   X   X   X   X   X   X       X X         ',
				hs: 'X   X   X     X X   X   X     X X   X   X     X X X             ',
				re: 'f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r ',
				sn: 'X..XX..XX.......X..XX..XX.X.X.X.X..XX..XX.......X..XX..XX.X.X.X.',
				ta: 'XX      X X X   XX      X X X   XX      X X X   XX      X X X   ',
				ag: 'o oao oao o a o o oao oao o a o o oao oao o a o o oao oao o a o ',
				sh: '................................................................'
			},
			'Break 1': {
				ls: 'X X XX  X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 2': {
				ls: 'X   X   X   XXX ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X   X XXX ',
				sn: '@re',
				ta: '@re',
				ag: '@re'
			},
			'White Shark': {
				ls: 'X               X       X               X       X       X       X   X   X   X   X   X   X   X   X   X   X   X   X       X       ',
				ms: '@ls',
				hs: '@ls',
				re: '   X               X       X               X       X       X      X   X   X   X   X   X   X   X   X   X   X   X   X     X       ',
				sn: '@re',
				ta: '@re',
				ag: '                                                                                ooa         ooa ooa         ooa                 '
			}
		},
		exampleSong: [ "Tune", "Break 1", "Tune", "Break 2", "Tune", "White Shark", "Tune" ]
	},
	'Funk': {
		categories: [ "standard", "common", "onesurdo", "easy" ],
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
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Hafla': {
		categories: [ "standard", "common", "tricky" ],
		sheet: sheetUrl + "hafla.pdf",
		description: require("../assets/tuneDescriptions/hafla.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/2fbb7d46-3399-4818-89aa-a5dc0b377238",
		patterns: {
			Tune: {
				loop: true,
				ls: 'X       X       X X     X       ',
				ms: '  X   X     X         X     X   ',
				hs: '    X   X   X       X   X   X   ',
				re: 'r X   X r   X   r X XXr r   X XX',
				sn: '..X...X.....X.....X.XXX.....X.XX',
				ta: 'X X   X X   X XXX X   X X   X   ',
				ag: 'o a   a o   a     a   a o   a   ',
				sh: '................................'
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
			'Kick Back 1': {
				loop: true,
				ls: 'X       X       X       X       X       X       X       X       ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X     X     X   X     X     X   X     X     X   X     X   ',
				sn: '@re',
				ta: '@re',
				ag: 'a a aaa a aaa aaa a aaa a aaa aao o ooo o ooo ooo o ooo o ooo oo',
				sh: '@re'
			},
			'Kick Back 2': {
				loop: true,
				ls: 'X       X       X       X X     ',
				ms: '@ls',
				hs: '@ls',
				re: '   X  X    X  X    X  X     X   ',
				sn: '   X  X    X  X    X  X     X ..',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 3': {
				ls: '    X       X       X X     X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: 'XXXX            XXXX    XXXX    ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Hook Break': {
				ls: 'X X     X       X       X X     X   X   X   X   X       X       ',
				ms: '@ls',
				hs: '@ls',
				re: '   XXX    XXX XX  XXXXX     X XX  XX  XX  XX  XX  X   X     X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Yala Break", "Tune", "Tune", "Break 3", "Tune", "Tune", "Hook Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Tune", "Tune", "Kick Back 2", "Kick Back 2", "Tune", "Tune" ]
	},
	'Hedgehog': {
		categories: [ "standard", "uncommon", "easy" ],
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
		exampleSong: [ "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Hip Hop': {
		categories: [ "proposed", "tricky" ],
		sheet: sheetUrl + "hiphop.pdf",
		description: require("../assets/tuneDescriptions/hiphop.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'X X    X  X     X X    X  X   s ',
				ms: 'X X    X        X X    X        ',
				hs: 'X X      XX     X X      XX     ',
				re: 'f   X       X   f   X       X h ',
				sn: 'XX..X..X....X...XX..X..X....X...',
				ta: '    X  X  X X       X    XX X   ',
				ag: 'o o a  o  o a   o o a    oo a   ',
				sh: 'X...X...X...X...X...X...X...X...'
			},
			'Kick Back 1': {
				loop: true,
				ls: 'X      X  X     ',
				ms: '@ls',
				hs: '@ls',
				re: '    X       X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Kick Back 2': {
				loop: true,
				ls: 'X X    X XX     ',
				ms: '@ls',
				hs: '@ls',
				re: '    X       X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 1': {
				ls: 'X      X X X    ',
				ms: '@ls',
				hs: '@ls',
				re: '    X       X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Kick Back 2", "Kick Back 2", "Tune", { patternName: "Tune", length: 4 }, "Break 1", "Tune", "Tune" ]
	},
	'Jungle': {
		categories: [ "proposed", "tricky", "western" ],
		sheet: sheetUrl + "jungle.pdf",
		description: require("../assets/tuneDescriptions/jungle.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '    X       X X     X       X X ',
				ms: 'XXXX    XX      XXXX    XX      ',
				hs: ' X    X  X    X  X    X  X    X ',
				re: ' f  r X  f  r X  f  r X  f  r X ',
				sn: 'XX..X...XX..X...XX..X..X.X..X...',
				ta: 'X  X    X  X  X X  X    X  X  X ',
				ag: 'ooo a o aa  o   aaa   o aa  o   ',
				sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			'Break 1': {
				ls: 'XXX             XXX X           XXX             XXX X X XX  X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '      o aa  o         o aa  o         o aa  o   ooo o o oo  o   ',
				sh: '@ls'
			},
			'Break 2': {
				ls: 'X  XX X X  XX X ',
				ms: 'X  XX X X  XX   ',
				hs: '@ms',
				re: '@ms',
				sn: '@ms',
				ta: '@ms',
				ag: '@ms',
				sh: '@ms'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Kaerajaan': {
		categories: [ "proposed", "medium", "onesurdo", "western" ],
		sheet: sheetUrl + "kaerajaan.pdf",
		description: require("../assets/tuneDescriptions/kaerajaan.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: "X   0 X X   0 X X   0 X X   X",
				ms: "@ls",
				hs: "@ls",
				re: "  XX  X   XX  X   XX  X f X X",
				sn: "....X.......X.......X.......X...",
				ta: "X X X   X X X   X X XX XX   X",
				ag: "a a o  oa a o  oa a a a o   o  o",
				sh: "@sn"
			},
			"Break 1": {
				ls: "X X X   X X X   X X XX XX    ",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "a a o   a a o   a a aa ao    ",
				sh: ". . .   . . .   . . .. ..    ",
				ot: "                            F"
			},
			'Break 2': {
				ls: '                X X XXX X X X                   X X XXX   X X   ',
				ms: '@ls',
				hs: '@ls',
				re: 'X   X  XX X X                   X   X  XX X X                   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Karla Shnikov': {
		categories: [ "standard", "common", "onesurdo", "easy" ],
		sheet: sheetUrl + "karla-shnikov.pdf",
		description: require("../assets/tuneDescriptions/karla-shnikov.md").default,
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
		exampleSong: [ "Tune", "Break 2", "Tune", "Break 2 Inverted", "Tune" ]
	},
	'March for Biodiversity': {
		categories: [ "proposed", "tricky", "western" ],
		description: require("../assets/tuneDescriptions/march-for-biodiversity.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'X X X X XXX XXX X X X X XXX XXX X X X X XXX XXX X X X X X   X   ',
				ms: 's s s s         s s s s         s s s s         s s s s X   X   ',
				hs: '        XXX XXX         XXX XXX         XXX XXX         X   X   ',
				re: 'f r   rrf r  r  f r   rrf r  r  f r   rrf r  r  f r   rrf X  s  ',
				sn: '. . X . . . X . . . X . . . X . . . X . . . X . . . X . . . X . ',
				ta: '    X  X  X XX  X  X  X  XX XXX     X  X  X XX  X  X  X  XX XXX ',
				ag: 'o   o   o a aa  o a aa  o   o   a   a   a o oo  o o o o o   a   ',
				sh: '. . X . . . X . . . X . . . X . . . X . . . X . . . X . . . X . '
			},
			Intro: {
				ls: 's   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s        X X XX ',
				ms: '                               X   X   X   X   X   X   X   X   X   X   X   X   X         X X XX ',
				hs: '                             X   X   X   X   X   X   X   X   X   X   X   X   X   X       X X XX ',
				re: '  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX         X X XX ',
				sn: '                                                         f   f   f   f   f   f   f ....X X X XX ',
				ta: '                                                        X   X   X   X   X   X   X        X X XX ',
				ag: '                                                aao         aao             aao          a a aa '
			},
			'Break 1': {
				ls: 'rrr X XXr rrX   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: 'rrr o oor rro a '
			},
			'Break 2': {
				ls: 'X X X X X       ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: '          F     '
			}
		},
		exampleSong: ['Intro', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune']
	},
	'Menaiek': {
		categories: [ "standard", "uncommon", "new", "tricky" ],
		sheet: sheetUrl + "menaiek.pdf",
		description: require("../assets/tuneDescriptions/menaiek.md").default,
		patterns: {
			Tune: {
				loop: true,
				time: 12,
				ls: stretch(4, 12, 'X   s X X   s X X   s X X   s X '),
				ms: stretch(4, 12, '    s   X         s     X   X   '),
				hs: stretch(4, 12, 'X   s         X   s         X   '),
				re: stretch(4, 12, 'rrX s   f  f  f       Xhr Xhr Xh'),
				sn: stretch(4, 12, 'X..XX..XX..XX.X.X..XX..XX...X.X.'),
				ta: stretch(4, 12, 'X   X XXX X   f       f     ') + stretch(3, 12, 'XXX'),
				ag: stretch(4, 12, 'o   a   o     o   a   o o   o   '),
				sh: stretch(4, 12, 'X..XX..XX..XX..XX..XX..XX..XX..X')
			},
			"Break 1": {
				ls: 'X X X XX X XX X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Break 2": {
				ls: repeat(3, '                      XXX XX  XX'),
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: repeat(3, 'o   a   o     o                 ') + 'o a o  o a oo o                 ',
				sh: '@ls'
			},
			"Double Break": {
				time: 12,
				ls: repeat(2, stretch(4, 12, 'X hXX hXX hXX hX')),
				ms: repeat(2, stretch(4, 12, '  s X    s  X X ')),
				hs: repeat(2, stretch(4, 12, 'X s    X s    X ')),
				re: stretch(4, 12, 'rrX s   f  f  f       Xhr Xhr Xh'),
				sn: stretch(4, 12, 'X..XX..XX..XX.X.X..XX..XX...X.X.'),
				ta: stretch(4, 12, 'X   X XXX X   f       f     ') + stretch(3, 12, 'XXX'),
				ag: repeat(2, stretch(4, 12, 'o a o  o a oo oa')),
				sh: stretch(4, 12, 'X..XX..XX..XX..XX..XX..XX..XX..X')
			},
			"Kick Back 1": {
				loop: true,
				time: 12,
				ls: stretch(4, 12, 'X   X  X   XX X '),
				ms: '@ls',
				hs: '@ls',
				re: stretch(4, 12, '  X       X ') + stretch(3, 12, 'XXX'),
				sn: '@re',
				ta: '@re',
				ag: stretch(4, 12, 'oaaoaaoa        '),
				sh: '@re'
			},
			"Mozambique Break": {
				ls: '   h  0    h  0 ',
				ms: '@ls',
				hs: '@ls',
				re: 'r r rr r rr rr r',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: 'X X XX X XX XX X'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Double Break", "Tune", "Tune", "Mozambique Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Tune", "Tune" ]
	},
	'No Border Bossa': {
		categories: [ "standard", "uncommon", "onesurdo", "medium" ],
		sheet: sheetUrl + "no-border-bossa.pdf",
		description: require("../assets/tuneDescriptions/no-border-bossa.md").default,
		patterns: {
			Tune: {
				loop: true,
				upbeat: 2,
				ls: 's s   h X X   h s s   h X X X h s s   h X X   h s s   h X   X h s ',
				ms: '@ls',
				hs: '@ls',
				re: '    X r   fh fh f   X r   fh fh f   X r   fh fh f   X r   fh fh f ',
				sn: '  X..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..X',
				ta: '    X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X ',
				ag: '  a a . o o o . a a a . o o o . a a a . o o o . a a a . o o o . a ',
				sh: '@sn'
			},
			'Break 1': {
				ls: '  X X   X  X  X   X X   XX XX   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 2': {
				upbeat: 2,
				ls: 's s     s s     s s     s s     s ',
				ms: '@ls',
				hs: '@ls',
				re: '    X r   fh fh f   X r   fh fh f ',
				sn: '  X..XX..XX..XX..XX..XX..XX..XX..X',
				ta: '    X X   X  X  X   X X   X  X  X ',
				ag: '  a a . o o o . a a a . o o o . a ',
				sh: '@sn'
			},
			'Break 2*': {
				upbeat: 2,
				ls: 's s     s s     s s     s s     s ',
				ms: '@ls',
				hs: '@ls',
				re: '    X r   fh fh f   X r   fh fh f ',
				sn: '  X..XX..XX..XX..XX..XX..XX..XX..X',
				ta: '    X X   X  X  X   X X   X  X  X ',
				ag: '  a a . o o o . a a a . o o o . a ',
				volumeHack: {
					ls: crescendo(32),
					ms: crescendo(32),
					hs: crescendo(32)
				}
			},
			'Bra Break': {
				displayName: "Call Break",
				ls: '                        XX XX   ',
				ms: '@ls',
				hs: '@ls',
				re: 'X X X   X  X  X   X X           ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: [ "Tune", "Break 1", "Tune", "Bra Break", "Tune" ]
	},
	'Norppa': {
		categories: [ "proposed", "tricky", "western" ],
		description: require("../assets/tuneDescriptions/norppa.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: "X   X   X   X   ",
				ms: "      X        X",
				hs: "  X       X     ",
				re: "  X   X   X  f r",
				sn: "..X...X...X..X.X",
				ta: " X   X   X XX  X",
				ag: "   a    a  a   a"
			},
			'Break 1': {
				ls: "        X       ",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "X.X.X.X.X       ",
				ta: "@ls",
				ag: "        o       ",
				ot: "            F   "
			},
			'Break 2': {
				ls: " X X X X X X X XX X X X X       ",
				ms: "                X X X X X       ",
				hs: "X X X X X X X X X X X X X       ",
				re: "        r r r r rrrrXXXXX       ",
				sn: "        . . . . X.X.XXXXX       ",
				ta: "            X X X X X X X       ",
				ag: "                           ooooo",
			},
			'Break 3': {
				ls: "X X X X X X X X ",
				ms: "    X X X X X X ",
				hs: "      X X X X X ",
				re: "        X X X X ",
				sn: "          X X X ",
				ta: "            X X ",
				ag: "              o "
			},
			'Call break': {
				ls: "X               ",
				ms: "@ls",
				hs: "@ls",
				re: "        X       ",
				sn: "@re",
				ta: "@re",
				ag: "        o       ",
				ot: "    F       F   ",
			},
			'Shouting break': {
				displayName: 'Shouting break (replace with own shout)',
				ls: "X            XX ",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "a            aa ",
				sh: "@ls",
				ot: "  '  =Å \\ l     ",
			},
			'Break 5': {
				ls: "X           XXXX",
				ms: "X            XXX",
				hs: "X             XX",
				re: "X              X",
				sn: "X               ",
				ta: "X XXXX         X",
				ag: "o      a        ",
				sh: "X               "
			}
		},
		exampleSong: ['Tune', 'Tune', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 3', 'Tune', 'Tune', 'Tune', 'Tune', 'Call break', 'Tune', 'Tune', 'Tune', 'Tune', 'Shouting break', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 5', 'Tune', 'Tune', 'Tune', 'Tune']
	},
	'Nova Balanca': {
		displayName: "Nova Balança",
		categories: [ "standard", "uncommon", "medium" ],
		sheet: sheetUrl + "nova-balanca.pdf",
		description: require("../assets/tuneDescriptions/nova-balanca.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'X  X            ',
				ms: '     XX       X ',
				hs: '        X  X    ',
				re: 'XX  X       X   ',
				sn: '....X...XX..X...',
				ta: 'X  XX X X  XX X ',
				ag: 'o  oa o o  oa o ',
				sh: '................'
			},
			'Bra Break': {
				displayName: "Call Break",
				ls: '    X     X         X     X     ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: 'XXXXX XXXXX     XXXXX XXXXX     ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 1': {
				ls: 'X X X X X X X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: crescendo(16)
			},
			'Break 2': {
				ls: 'X X X X XX XX X ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X  X X  X ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune" ]
	},
	'Orangutan': {
		categories: [ "standard", "uncommon", "tricky" ],
		sheet: sheetUrl + "orangutan.pdf",
		description: require("../assets/tuneDescriptions/orangutan.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '    XXXX    XXXX',
				ms: 'X XX        XXXX',
				hs: '        X XX    ',
				re: 'X rrX rr rrrX r ',
				sn: '..XX..XX..XX..XX',
				ta: '  XX XX   XX XX ',
				ag: 'oa  o aa o  a oo',
				sh: '@sn'
			},
			"Funky gibbon" : {
				ls: 'X   X   X  XX X XX              X   X   X  XX X X               ',
				ms: '@ls',
				hs: '@ls',
				re: '  r   r   r   r   r   r   r   r   r   r   r   r   r   r   r   r ',
				sn: '..X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X.',
				ta: '@re',
				ag: '@re',
				sh: '  X   X   X   X   X   X   X   X   X   X   X   X   X   X   X   X '
			},
			"Monkey break" : {
				ls: '  XX XX   XX XX ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: 'G       G       '
			},
			"Break 2": {
				ls: 'X   X       X   ',
				ms: '@ls',
				hs: '@ls',
				re: '  XX  XX XXX  X ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Monkey break", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Funky gibbon", "Funky gibbon", "Tune", "Tune", "Tune", "Tune" ]
	},
	'Pekurinen': {
		categories: [ "proposed", "tricky", "western" ],
		description: require("../assets/tuneDescriptions/pekurinen.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '    X       X X     X     X     ',
				ms: 'X       X       X       X       ',
				hs: 'X       X       X       X     X ',
				re: 'f XXX X XXX X XXf XXX X fXX X   ',
				sn: 'X...X.X..X..X.X.X...X.X..X..X...',
				ta: 'X XX  X XX  X XX  X XX   XX   X ',
				ag: 'a  o  a   o   a a  o  a  aa o   ',
				sh: '................................'
			},
			'Break 1': {
				ls: '        X X X   ',
				ms: '@ls',
				hs: '@ls',
				re: 'X XX Xf X X X   ',
				sn: '@ls',
				ta: '@ls',
				ag: '        o o o a ',
				sh: '@ls'
			},
			'Break 2': {
				ls: '                        X X X   ',
				ms: '@ls',
				hs: '@ls',
				re: '  XX XX   XX XX   XX XX X X X   ',
				sn: '@re',
				ta: '@re',
				ag: 'a       a       a       a a a   ',
				sh: '@re'
			},
			'Break 3': {
				ls: '                                                X X X X X   X   ',
				ms: '        XXX XXX         XXX XXX         XXX XXX             X   ',
				hs: '@ms',
				re: '@ms',
				sn: '@ms',
				ta: 'X X X X         X X X X         X X X X                     X   ',
				ag: '@ms',
				sh: '@ms'
			},
			'Clave Plus': {
				ls: 'X  X  X   XXX   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Disco Barricade Break': {
				ls: '                X  X  X   XXX   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: 'İ Ǐ İ Ǐ Ī ĨĮ Ĳ                  '
			},
			'Bra Break': {
				displayName: "Call Break",
				ls: '                        X  X X  ',
				ms: '@ls',
				hs: '@ls',
				re: 'f XXXX r XXXX r X XX rr X  X X  ',
				sn: '@ls',
				ta: '       X      X      XX X  X X  ',
				ag: '       a      a      aa        a',
				sh: '@ls'
			}
		},
		exampleSong: ['Tune', 'Tune', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 3', 'Tune', 'Tune', 'Tune', 'Tune', 'Clave Plus', 'Tune', 'Tune', 'Tune', 'Tune', 'Disco Barricade Break', 'Tune', 'Tune', 'Tune', 'Tune', 'Bra Break', 'Tune', 'Tune', 'Tune', 'Tune']
	},
	'Ragga': {
		categories: [ "standard", "common", "tricky" ],
		sheet: sheetUrl + "ragga.pdf",
		description: require("../assets/tuneDescriptions/ragga.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/bb2a4cd6-021b-4596-9917-f53bed8363a8",
		patterns: {
			Tune: {
				loop: true,
				ls: 'X  X  0 X  X  0 X  X  0 X  X  0 ',
				ms: '0  X  X 0  X  X 0  X  X 0  X  X ',
				hs: '0     X 0     X 0     X 0     X ',
				re: '  X   X   X   X   X   X  XXX  X ',
				sn: '..XX..X...XX..X...XX..X...XX..X.',
				ta: '  X   X   X   X   X   X   XX  X ',
				ag: 'o a o a oa ao a o a  oooo a o   ',
				sh: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			'Kick Back 1': {
				loop: true,
				ls: 'X  X    X  X    X  X    X  X    ',
				ms: '@ls',
				hs: '@ls',
				re: '      X       X       X       X ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Kick Back 2': {
				loop: true,
				ls: 'X  X X  X  X X  X  X X  X  X X  ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X   X   X   X   X   X   X ',
				sn: '@re',
				ta: '@re',
				ag: 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa',
				sh: '@re'
			},
			'Break 2': {
				ls: 'X           XXX ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 3': {
				ls: 'X  X  X         ',
				ms: '@ls',
				hs: '@ls',
				re: '        X  X  X ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Zorro-Break': {
				ls: 'X       X       X       X  X  X ',
				ms: '@ls',
				hs: '@ls'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Tune", "Tune", "Zorro-Break", "Zorro-Break", "Tune", "Tune" ]
	},
	'Rope Skipping': {
		categories: [ "standard", "uncommon", "tricky" ],
		sheet: sheetUrl + "rope-skipping.pdf",
		description: require("../assets/tuneDescriptions/rope-skipping.md").default,
		patterns: {
			Tune: {
				loop: true,
				time: 12,
				ls: stretch(4, 12, repeat(2, 'XXXXXXXXX   X               X X ')),
				ms: stretch(4, 12, repeat(2, '  ss       XX     ss       XX   ')),
				hs: stretch(4, 12, repeat(2, '            X X XXXXXXXXX   X   ')),
				re: stretch(4, 12, repeat(2, 's XXf   s XXf   s XXf   XXX f   ')),
				sn: stretch(4, 12, repeat(2, '....X.......X.......X..XX..XX...')),
				ta: stretch(4, 12, 'X  XX   X  XX   X  XX  XX  XX   X  XX   X  XX   X  XX   ') + stretch(3, 12, 'XXX   '),
				ag: stretch(4, 12, repeat(2, 'a  aa  oo  oo a a  aa  oo  oo a ')),
				sh: stretch(4, 12, repeat(2, '................................'))
			},
			'Oh Shit': {
				ls: 'X               ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: '        N   O   '
			},
			'Fuck Off': {
				ls: 'X               ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: '        P   Q   '
			},
			'Break 1': {
				ls: 'X      XX         X    XX       ',
				ms: '@ls',
				hs: '@ls',
				re: '    X     X         X     X X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 2': {
				ls: 'XX  XX  XX  X     XX  XX  XX    ',
				ms: '@ls',
				hs: '@ls',
				re: '  XX  XX  XX    XX  XX  XX  X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 3': {
				ls: 'X   X   X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: ' XX  XX  XX     ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Küsel Break': {
				ls: 'X XXX X X X X                   ',
				ms: '@ls',
				hs: '@ls',
				re: '                X XXX X X X X   ',
				sn: 'X..XX..XX...X.X.X.X.X.X.X.X.X...',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Skipping Agogo': {
				displayName: "Skipping Agogô",
				ag: 'a  aaa aa  aaaoao  ooo oo  oooao'
			},
			'I like to move it': {
				loop: true,
				re: '                X   X   X   X   ',
				ag: 'o   o   o   o a           a   a '
			},
			'Eye of the tiger': {
				time: 12,
				ls: stretch(4, 12, '                                              X                 '),
				ms: stretch(4, 12, '           X               X               X                    '),
				hs: stretch(4, 12, 'X       X     X         X     X         X                       '),
				sn: stretch(4, 12, '................................................                '),
				ag: stretch(4, 12, '                                                ') + 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa'
			}
		},
		exampleSong: [ "Tune", "Tune", "Oh Shit", "Tune", "Tune", "Fuck Off", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Küsel Break", "Küsel Break", "Tune", "Tune", "Skipping Agogo", "Tune", "Tune", "I like to move it", "Tune", "Tune", "Eye of the tiger", "Tune", "Tune" ]
	},
	'Samba Reggae': {
		categories: [ "standard", "common", "medium", "cultural-appropriation" ],
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
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune", "Tune", "Tune", "Tune", "Knock On The Door Break", "Knock On The Door (Cut)", "Tune", "Tune", "Tune", "Tune", "Dancing Break", "Tune", "Tune", "Tune", "Tune" ]
	},
	"Samba Reggae High": {
		categories: [ "proposed", "cultural-appropriation" ],
		description: require("../assets/tuneDescriptions/samba-reggae-high.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: "0   X   0   X X ",
				ms: "X   0   X   0   ",
				hs: "0     X 0   XXXX",
				re: "  XX  XX  XX  XX",
				sn: "X..X..X...X..X..",
				ta: "X XX XXX  X  X  ",
				ag: "o a a oo a aa o ",
				sh: "................"
			},
			"Break 1": {
				ls: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ",
				ms: "@ls",
				hs: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX",
				re: "XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ",
				sn: "                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls"
			},
			"Break 2": {
				ls: "            XXXX            XXXX            XXXX            XXXX",
				ms: "@ls",
				hs: "@ls",
				re: "X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
				sn: "@ls",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls"
			},
			"Break 3": {
				ls: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ",
				ms: "@ls",
				hs: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX",
				re: "                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ",
				sn: "X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...",
				ta: "                                X  X  X   X                     X  X  X   X                 X X             X X                 ",
				ag: "                                X  X  X   X                     X  X  X   X                 a a             a a                 ",
				sh: "                                X  X  X   X                     X  X  X   X                                                     "
			},
			"Pickup": {
				hs: "            XXXX"
			},
			"Stop on 1": {
				ls: "X               ",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls"
			},
			"Tam Entrada": {
				time: 3,
				ta: "XXXXXXXXXXXX",
			},
			"Tam “Bossa Mess About”": {
				time: 12,
				ta: stretch(4, 12, "X  X  X   X  X  X  X  X  XX  X  X  X  X  XX XX  X  X  X ") + stretch(3, 12, "XXXXXX"),
			},
			"Tam “Little Turn” Groove": {
				ta: "X   XXXXX       X X XXXXX       X X X   XXXXX   XX XX   XXXXX   "
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "Stop on 1" ]
	},
	"Samba Reggae Low": {
		categories: [ "proposed", "cultural-appropriation" ],
		description: require("../assets/tuneDescriptions/samba-reggae-low.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: "0   X   0   X   0   X   0   X   ",
				ms: "X   0   X   0   X   0   X   0   ",
				hs: "0     XX0     XX0     XX0 X XXXX",
				re: "  XX  XX  XX  XX  XX  XX  XX  XX",
				sn: "X..X..X...X.X...X..X..X...X.X...",
				ta: "X  X  X   X X   X  X  X   X X   ",
				ag: "o  a  o   a a   o  a  o   a a   ",
				sh: "................................"
			},
			"Bra Break": {
				displayName: "Call Break",
				ls: "          X X             X X             X X                                                                 X ",
				ms: "          X X             X X             X X                                                                   ",
				hs: "@ms",
				re: "f XX XX X       f XX XX X       f XX XX X                                                                       ",
				sn: "          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...",
				ta: "          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
				ag: "@ms",
				sh: "@ms"
			},
			"SOS Break": {
				ls: "X       X       X       X       X       X       X       X     X ",
				ms: "X       X       X       X       X       X       X       X       ",
				hs: "@ms",
				re: "  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ",
				sn: "@re",
				ta: "@re",
				ag: "@re",
				sh: "@re"
			},
			"Knock On The Door Break": {
				time: 12,
				ls: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
				ms: "@ls",
				hs: "@ls",
				re: "@ls",
				sn: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls"
			},
			"Knock On The Door (Cut)": {
				time: 12,
				ls: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
				ms: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
				hs: "@ms",
				re: "X                                   X   X   X   X                                               X        X        X           X     X     X     X     X     X  X     X     X     X     X  X     ",
				sn: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
				ta: "@ms",
				ag: "@ms",
				sh: "@ms"
			},
			"Dancing Break": {
				ls: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                 X ",
				ms: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   ",
				hs: "@ms",
				re: "                X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X   ",
				sn: "@re",
				ta: "@re",
				ag: "@re",
				sh: "@re"
			},
			"Pickup": {
				ls: "              X "
			},
			"Stop on 1": {
				ls: "X               ",
				hs: "@ls",
				re: "@ls",
				sn: "@ls",
				ta: "@ls",
				ag: "@ls",
				sh: "@ls"
			},
			"Fancy Tam Line": {
				ta: repeat(2, "X  X  X   X X   X  X  X   X X   ") + repeat(2, "X  X  X   X X XXX  X  X XXX X   ")
			},
			"Fancy Tam Line 2": {
				ta: repeat(2, "X  X  X         X  X  X         ") + repeat(2, "X  X  X   XXX XXX  X  X         ")
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune", "Tune", "Tune", "Tune", "Knock On The Door Break", "Knock On The Door (Cut)", "Tune", "Tune", "Tune", "Tune", "Dancing Break", "Tune", "Tune", "Tune", "Tune", "Stop on 1" ]
	},
	'Sambasso': {
		categories: [ "standard", "common", "onesurdo", "tricky" ],
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
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
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
		exampleSong: [ "Intro", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Sheffield Samba Reggae': {
		categories: [ "standard", "uncommon", "medium", "cultural-appropriation" ],
		sheet: sheetUrl + "sheffield-samba-reggae.pdf",
		description: require("../assets/tuneDescriptions/sheffield-samba-reggae.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '    X X     XXXX    X X     XXXX    X X     XXXX    X X     XXXX',
				ms: 'X       X       X       X       X       X       X       X       ',
				hs: '    X X     X X     X X X X XXXX    X X     X X     X X X X XXXX',
				sn: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
				re: '@sn',
				ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
				ag: repeat(4, '  a o o aa oa o '),
				sh: '................................................................'
			},
			'Intro': {
				ls: '                           XX X X             X X             X X             X XX X X X    X X ',
				ms: '@ls',
				hs: '@ls',
				re: 'X X X X X  XXXXXX X X X X          fXX X fXXX      fXX X fXXX      fXX X fXXX            fXX    ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 1': {
				loop: true,
				ls: 'X               X               X               X               ',
				ms: '@ms',
				hs: '@hs',
				sn: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
				re: '@sn',
				ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
				ag: repeat(4, '  a o o aa oa o '),
				sh: '................................................................'
			},
			'Break 2': {
				ls: 'X               X             X X               X               ',
				ms: '@ls',
				hs: '@ls',
				sn: 'XXrXXXrXXXrXX r XXrXXXrXXXrXX r XXrXXXrXXXrXXXrXX X X X fXX X X ',
				re: '@sn',
				ta: '  X   X   X   X   X   X   X   X   X   X   X   XXX X X X     X X ',
				ag: '@ta',
				sh: '@ta'
			},
			'Break 3': {
				ls: 'X  X  X         X  X  X         ',
				ms: '@ls',
				hs: '@ls',
				sn: '        X  X  X         XXXXX X ',
				re: '@sn',
				ta: '@sn',
				ag: '@sn',
				sh: '@sn'
			},
			'Whistle Break': {
				loop: true,
				ls: 'X  XX  XXX XX   ',
				ms: '@ls',
				hs: '@ls',
				sn: '  X   X   X   X ',
				re: '@sn',
				ta: '@sn',
				ag: '@sn',
				sh: '@sn'
			},
			'Outro': {
				upbeat: 2,
				ls: 'X XX X X X      X X               ',
				ms: '@ls',
				hs: '@ls',
				sn: '@ls',
				re: 'X XX X X X fXXX X X               ',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: [ "Intro", "Tune", "Break 1", "Tune", "Break 2", "Tune", "Break 3", "Tune", "Whistle Break", "Tune", "Outro" ]
	},
	'Tequila': {
		categories: [ "standard", "uncommon", "new", "medium", "western" ],
		sheet: sheetUrl + "tequila.pdf",
		description: require("../assets/tuneDescriptions/tequila.md").default,
		patterns: {
			Tune: {
				loop: true,
				upbeat: 1,
				ls: 'X0 00 X 0 X     X0 00 X 0        ',
				ms: ' X XX   X        X XX   X        ',
				hs: '     X               X           ',
				re: '     X      hX       X    X XrXh ',
				sn: ' ....X.......X.X.....X.......X...',
				ta: '     X       X X     X       X   ',
				ag: ' a a o  a a ao o a a o  a        ',
				sh: ' ................................'
			},
			'Break 1': {
				ls: '                ',
				ms: '                ',
				hs: '                ',
				ag: 'ooooo o a       ',
				ot: '           uvx  '
			},
			'Break 2': {
				upbeat: 3,
				ls: 'X               X               X                  ',
				ms: ' XX       X      XX       X      XX       X        ',
				hs: '   X               X               X               ',
				sh: '   XXXXXXXX        XXXXXXXX        XXXXXXXX        '
			},
			'Bra Break': {
				displayName: "Call Break",
				ls: repeat(3, '    X       X X '),
				ms: '@ls',
				hs: '@ls',
				re: repeat(3, 'X X    X X X    '),
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 2", "Break 1", "Tune", "Tune", "Bra Break", "Break 1", "Tune", "Tune" ]
	},
	'The Roof Is on Fire': {
		categories: [ "standard", "uncommon", "new", "tricky", "western" ],
		sheet: sheetUrl + "the-roof-is-on-fire.pdf",
		description: require("../assets/tuneDescriptions/the-roof-is-on-fire.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/1c318897-e3b7-436b-b319-4608774169e0",
		patterns: {
			Tune: {
				loop: true,
				ls: "        X       X       X   X   X ",
				hs: "    XXX     XXX     XXX     X   X ",
				re: "  X  X  X  XXXX   X X X X  XXXX   ",
				sn: "  ...XX.....X.X......XX.....X.X...",
				ta: "    X       X     X X X X   X     ",
				ag: "o a     o a     o a a a   a       ",
				sh: "  ................................",
				upbeat: 2
			},
			"Break 1": {
				ls: "    X X     X X             X     ",
				ot: "i l     i l     i l p $ % &       ",
				upbeat: 2
			},
			'Bra Break': {
				displayName: "Call Break",
				ls: "                X     X X                       X     X X                       X     X X                       ",
				ms: "@ls",
				hs: "@ls",
				re: "X..X..X.X..X..X.                X..X..X.X..X..X.                X..X..X.X..X..X.                X  X  X X       ",
				sn: "@ls",
				ta: "@ls",
				ag: "                o     o a  a  a                 o     o a  a  a                 o     o a  a  a                 ",
				sh: "@ls",
				ot: "                                                                                                            '   "
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune" ]
	},
	'The Sirens of Titan': {
		categories: [ "proposed" ],
		time: 3,
		speed: 120,
		sheet: sheetUrl + "the-sirens-of-titan.pdf",
		description: require("../assets/tuneDescriptions/the-sirens-of-titan.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'X  X              X  X        X  X        XXXX  ',
				ms: '            X  X        X  X                    ',
				hs: '      XXXX                          X  X        ',
				re: repeat(4, 'X  X  X XX  '),
				sn: repeat(4, 'X..X..X..X..'),
				ta: 'XXXX        XXXX        XXXX  XXXX  XXXX        ',
				ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
				sh: repeat(4, 'X XX  X XX  ')
			},
			'Rented a Tent Break': {
				ls: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX      X  ',
				ms: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX   XXX   ',
				hs: '   X  X  X     X  X  X     X     X        XXX   ',
				re: 'XXXX XX XX  XXXX XX XX  XXXX  XXXX  XXX   XXXX  ',
				sn: 'XXXX.XX.XX..XXXX.XX.XX..XXXX..XXXX..XXX...XXXX..',
				ta: '@re',
				ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
				sh: '@re'
			}
		},
		exampleSong: [ "Tune", "Rented a Tent Break", "Tune" ]
	},
	'Van Harte Pardon': {
		categories: [ "standard", "uncommon", "tricky" ],
		sheet: sheetUrl + "van-harte-pardon.pdf",
		description: require("../assets/tuneDescriptions/van-harte-pardon.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '0     XX0     X 0     XX0   X X ',
				ms: '@ls',
				hs: 's  X    s  X    s  X    ss sX   ',
				re: '  X   X  X X  X   X   X  X X  X ',
				sn: 'X..X..X.X..X..X.X..X..X.X..X..X.',
				ta: '  X   X  X X  X   X   X  X X  X ',
				ag: 'a.ooo.aa.o.oo.ooo.aaa.oo.a.aa.oo',
				sh: '................................'
			},
			'Break 1': {
				ls: '                XX XX XX        ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				ot: 'J           L               F   '
			},
			'Silence Break': {
				ls: '              XX',
				ag: '@ls'
			},
			'Break 2': {
				ls: 'X  s          X X  s          X ',
				hs: 'X  s            X  s            ',
				re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
				sn: '@re',
				ta: '      XXXX XX X       XXXX XX   ',
				ag: '      aaaa oa a       oooo ao   '
			},
			'Break 2 (Cut)': {
				ls: 'X  s          X X  s  ssss sX X ',
				hs: 'X  s            X  s  ssss sX   ',
				re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
				sn: '@re',
				ta: '      XXXX XX X       XXXX XX   ',
				ag: '      aaaa oa a       oooo ao   '
			},
			'Cross Break': {
				ls: 'X  s          X X  s          X ',
				hs: 'X  s            X  s            '
			},
			'Cross Eight Break': {
				ls: 'X X X X X X X X ',
				ms: '@ls',
				hs: '@ls',
				volumeHack: crescendo(16)
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Silence Break", "Tune", "Tune", "Break 2", "Break 2 (Cut)", "Tune", "Tune", "Cross Break", "Tune", "Tune", "Cross Eight Break", "Tune", "Tune" ]
	},
	'Voodoo': {
		categories: [ "standard", "uncommon", "easy", "cultural-appropriation" ],
		sheet: sheetUrl + "voodoo.pdf",
		description: require("../assets/tuneDescriptions/voodoo.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: '   XX 0    XX 0    XX 0 X X X 0 ',
				ms: 's   s X s   s X s   s X s   s X ',
				hs: '@ms',
				re: 'X  X  X X  X  X X  X  X X  X  X ',
				sn: 'X..X..X.X..X..X.X..X..X.X..X..X.',
				ta: 'X X X X X X X X XX              ',
				ag: 'a a o o oa a oo a a o o oa a oo ',
				sh: 'X.......X.......X.......X.......'
			},
			'Scissor Break': {
				ls: 'X X X X XX X XX ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: [ "Tune", "Tune", "Scissor Break", "Tune", "Tune" ]
	},
	'Walc(z)': {
		categories: [ "standard", "uncommon", "new", "easy", "western" ],
		time: 6,
		speed: 60,
		sheet: sheetUrl + "walc.pdf",
		description: require("../assets/tuneDescriptions/walc.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'X     X     X     X     ',
				ms: '  X X   X X   X X   XXXX',
				hs: '@ms',
				re: '  X X   XXX   X X   XXX ',
				sn: '..X.X...X.X...X.X.XXXXXX',
				ta: '  X X   X X       X X X ',
				ag: 'o a a o a a o a a o     ',
				sh: 'X X X X XXX X X X X XXX '
			},
			'Break 2': {
				ls: 'X X X                   ',
				ms: '      X X X             ',
				hs: '            X X X       ',
				re: '                  XXXXXX',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 3': {
				ls: 'X X X       X X X       X X   X X   X X X X     ',
				ms: '@ls',
				hs: '@ls',
				re: '      X           X         X     X X X X X     ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 5': {
				ls: '                  XXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '..X.X...X.X...X.X.XXXXXX',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Bra Break': {
				displayName: "Call Break",
				ls: '      X           X         X     X     X X     ',
				ms: '@ls',
				hs: '@ls',
				re: 'X X X       X X X       X X   X X   X X         ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Cut-throat Break': {
				ls: 'X     X     X           ',
				ms: '@ls',
				hs: '@ls',
				re: '  X X   X X   X X       ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Cut-throat Break Fast': {
				ls: 'X  X  X                 ',
				ms: '@ls',
				hs: '@ls',
				re: ' XX XX XX               ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			"Karla Break (6⁄4)": {
				ls: repeat(3, 'XXXXXXXXXXXXXXXXXXXXXXXX') + 'X                       ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: { 0: .1, 24: .4, 48: .7, 72: 1  }
			},
			"8 up (6⁄4)": {
				ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls',
				volumeHack: crescendo(48)
			},
			'Progressive (6⁄4)': {
				ls: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Progressive Karla (6⁄4)': {
				ls: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXXX                       ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Break 5", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Cut-throat Break", "Tune", "Tune" ]
	},
	'Wolf': {
		categories: [ "standard", "uncommon", "tricky", "new" ],
		sheet: sheetUrl + "wolf.pdf",
		description: require("../assets/tuneDescriptions/wolf.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: repeat(4, 'X   X   X   X   '),
				ms: repeat(4, '  XX     XXX    '),
				hs: repeat(2, '      XX      XX      XXXXXXXXXX'),
				re: repeat(2, 'X XX  r X X X rrX XX  r  XXXX rr'),
				sn: repeat(4, 'f.X...X...X...X.'),
				ta: 'X X     X X     XX XXX XX       X XX XX X X X X XX XXX XX       ',
				ag: repeat(4, 'ooooo a   a   a '),
				sh: repeat(4, '................')
			},
			'Pat 1': {
				ls: '              XXX     XXX       ',
				ms: '   X X     X X                  ',
				hs: 'XXXXXXXXX                       '
			},
			'Pat 2': {
				ls: '              XXX     XXX       ',
				ms: '   X X     X X                  ',
				hs: 'XXXXXXXXXXXXX                   '
			},
			'Break 1': {
				ls: '   XX  XX X X    XXXX  XX X X      XX  XX X X    XXXX  XX       ',
				ms: '@ls',
				hs: '@ls',
				sn: 'X               X               X               X               '
			},
			'Break 2': {
				ls: 'X X   XXX X    XX X    XX X     X X   XXX X    X X X X X        ',
				ms: '@ls',
				hs: '@ls',
				re: '    X       X       X       X       X       X  X X X X X        ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re',
				ot: '                                                            A   '
			}
		},
		exampleSong: [ "Tune", "Pat 1", "Tune", "Pat 2", "Tune", "Break 1", "Tune", "Break 2", "Tune" ]
	},
	'Xango': {
		displayName: "Xangô",
		categories: [ "standard", "uncommon", "tricky", "cultural-appropriation" ],
		sheet: sheetUrl + "xango.pdf",
		description: require("../assets/tuneDescriptions/xango.md").default,
		video: "https://tube.rhythms-of-resistance.org/videos/embed/ae1fe3a3-dd7e-4670-9415-b47ee60a54b0",
		patterns: {
			Tune: {
				loop: true,
				ls: repeat(2, 's   X XX        '),
				ms: repeat(2, 'X X             '),
				hs: repeat(2, '            XXXX'),
				re: repeat(2, ' XXX XXX XXX XXX'),
				sn: repeat(2, 'X..X....X.XX....'),
				ta: 'X X X X X X X X XX              ',
				ag: repeat(2, 'o a o  o o ao   '),
				sh: repeat(2, '................')
			},
			'Intro': {
				loop: true,
				re: repeat(4, 'r rrr r r r r r '),
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Intro+Surdos': {
				loop: true,
				ls: 'X         X X X X           X X X       X X X X X           X   ',
				ms: '@ls',
				hs: '@ls',
				re: repeat(4, 'r rrr r r r r r '),
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Boum Shakala Break': {
				ls: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X                 ',
				ms: '@ls',
				hs: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X             XXXX',
				re: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X                 ',
				sn: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X X..X..XXX       ',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Break 2': {
				ls: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   ',
				ms: '@ls',
				hs: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX XX',
				re: '                         X XX                            X XX                            X XX   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			}
		},
		exampleSong: [ "Intro", "Intro", "Intro+Surdos", "Intro+Surdos", "Tune", "Tune", "Boum Shakala Break", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Zurav Love / Truant': {
		displayName: "Żurav Love",
		categories: [ "standard", "uncommon", "tricky", "western" ],
		sheet: sheetUrl + "zurav-love.pdf",
		description: require("../assets/tuneDescriptions/zurav-love.md").default,
		patterns: {
			Tune: {
				loop: true,
				ls: 'X  X  X  X  X  X                ',
				ms: '@ls',
				hs: '                        X  X  X ',
				re: 'f   h X f   h   f   h X f   h   ',
				sn: 'X...X...X...X.....XXX...XXX.X...',
				ta: '    X       X       X       X   ',
				ag: '  aaa o aaa o     aaa           ',
				sh: '...XX......XX......XX......XX...'
			},
			"Bra Break": {
				displayName: "Call Break",
				ls: repeat(3, '        X       ') + 'X     X X  X  X ',
				ms: '@ls',
				hs: '@ls',
				re: repeat(3, 'f hr hr         ') + 'X     X X  X  X ',
				sn: repeat(3, '                ') + '..XXX...XXX.X...',
				ta: repeat(3, '           X  X ') + 'X     X X  X  X ',
				ag: '@ta',
				sh: '@ta'
			},
			"Kick Back 1": {
				loop: true,
				ls: '            X   ',
				ms: '@ls',
				hs: '@ls',
				re: '  XXX   XXX     ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"Kick Back 2": {
				loop: true,
				ls: '    X       X   ',
				ms: '@ls',
				hs: '@ls',
				re: '  XXX   XXX     ',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		},
		exampleSong: [ "Tune", "Tune", "Bra Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Tune", "Tune" ]
	}
};

const defaultTunes: { [tuneName: string]: Tune } = { };

for(const i in rawTunes) {
	const tune = rawTunes[i];
	const newTune = clone(tune) as any as Tune;

	for(const j in tune.patterns) {
		const pattern = tune.patterns[j];
		const newPattern = clone(pattern) as any as Pattern;
		if(!newPattern.time && tune.time)
			newPattern.time = tune.time;

		for(const k of config.instrumentKeys) {
			const thisPattern = pattern[k] = pattern[k] || "";
			const m = thisPattern.match(/^@([a-z]{2})$/);
			if(m)
				newPattern[k] = clone(newPattern[m[1] as Instrument]);
			else {
				newPattern[k] = thisPattern.split('');
				newPattern.length = Math.max(newPattern.length || 0, newPattern[k].length - (pattern.upbeat || 0));
			}

			if(k == "ag")
				newPattern[k] = newPattern[k].map(function(it) { return it == "X" ? "o" : it; });
		}

		newPattern.length = Math.ceil(newPattern.length / (newPattern.time || 4));

		newTune.patterns[j] = normalizePattern(newPattern);
	}

	defaultTunes[i] = normalizeTune(newTune);

	const unknown = (defaultTunes[i].exampleSong || []).filter((patternName) => !defaultTunes[i].patterns[typeof patternName === 'string' ? patternName : patternName.patternName]);
	if(unknown.length > 0)
		console.error(`Unknown breaks in example song for ${i}: ${unknown.join(", ")}`);
}

Object.defineProperty(defaultTunes, "getPattern", {
	configurable: true,
	value: function(tuneName: string | PatternReference, patternName?: string): Pattern | null {
		if(Array.isArray(tuneName)) {
			patternName = tuneName[1];
			tuneName = tuneName[0];
		}

		return this[tuneName] && this[tuneName].patterns[<string> patternName] || null;
	}
});

Object.defineProperty(defaultTunes, "firstInSorting", {
	configurable: true,
	value: [ "General Breaks", "Special Breaks", "Shouting Breaks" ]
});

interface DefaultTunesMethods {
	getPattern(tuneName: string, patternName?: string): Pattern | null,
	getPattern(patternReference: PatternReference): Pattern | null,
	firstInSorting: Array<string>
}

type DefaultTunes = TypedObject<Tune> & DefaultTunesMethods;

export default <DefaultTunes> defaultTunes;
