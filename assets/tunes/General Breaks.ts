import { crescendo, decrescendo, repeat, stretch } from "../../src/tuneHelper";

export default {
    categories: ["core", "common", "new", "onesurdo", "easy", "medium", "tricky"],
    sheet: require("./general-breaks.pdf"),
    description: require("./general-breaks.md").default,
    video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
    patterns: {
        'Whistle in': {
            ot: 'y       y       y   y   y   y   '
        },
        'Whistle in (long)': {
            ot: 'y               y               y       y       y   y   y   y   '
	},
        'Whistle in (short)': {
            ot: 'y   y   y   y   '
        },
        'Silence': {
            ls: repeat(16, ' ')
        },
        'Silence 2x': {
            ls: repeat(32, ' ')
        },
        'Silence 4x': {
            ls: repeat(64, ' ')
        },
	'4 Hits': {
            ls: repeat(4, 'X   '),
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
	},
	'8 Hits': {
            ls: repeat(8, 'X   '),
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
	},
	'Broccoli': {
            ls: "            X   ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
	},
        'Boom Break': {
            ls: 'X               ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls'
        },
        "Clave": {
            ls: 'X  X  X   X X   ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls'
        },
        "Clave 2x": {
            ls: repeat(2, 'X  X  X   X X   '),
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls'
        },
        "Clave 4x": {
            displayName: "Clave 4x soft to loud",
            ls: repeat(4, 'X  X  X   X X   '),
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            volumeHack: { 0: .2, 16: .4, 32: .7, 48: 1 }
        },
        'Karla Break': {
            ls: repeat(12, 'XXXX') + 'X   ' + repeat(3, ' '),
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: repeat(12, 'X X ') + 'X',
            ag: "@ta",
            volumeHack: { 0: .2, 16: .4, 32: .7, 48: 1 }
        },
        'Progressive Karla': {
            ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXXX               ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: 'X   X   X   X   X X X X X X X X X X X X X X X X X',
            ag: '@ta'
        },
	'e.g. Karla + Clave': {
            ls: repeat(12, 'XXXX') + 'X  X  X   X X   ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: repeat(12, 'X X ') + 'X  X  X   X X',
            ag: "@ta",
            volumeHack: { 0: .2, 16: .4, 32: .7, 48: 1 }
        },
        'Capped Karla': {
            loop: true,
            ls: 'XXXXXXXXXXXXXXXXX               ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: 'X X X X X X X X X',
            ag: '@ta',
            volumeHack: { 0: .2, 4: .4, 8: .7, 12: 1 }
        },
        'X Break': {
            ls: repeat(4, "X       X       X X X X X       "),
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls",
            ot: repeat(4, "  A A A   A A A             A   ")
	},
	'Flappy Mouth': {
            time: 3,
            ls: 'X  XXXX     ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            ot: '         A  '
	},
        'Knock On The Door': {
            loop: true,
            time: 12,
            ls: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
            ms: '@ls',
            hs: '@ls',
            re: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X X XX X X X XX '),
            sn: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
            ta: '@ls',
            ag: '@ls'
	},
	'Conga': {
            loop: true,
            ls: "X     X X   X X X     X X   X X X   X   X   X   X   X   X   X   ",
            ms: "@ls",
            hs: "@ls"
        },
        'Little Cat': {
            loop: true,
            upbeat: 2,
	    re: "X X     X X X X X   X X X X   X   X X X X X   X                   ",
            ta: "@re",
            ag: "@re",
	},
	'Little Cat (Alt Repi)': {
            loop: true,
	    re: "f   X X r r X X "
	},
        'Bunny Ears': {
            ls: repeat(2, "                X X X X X  XX   ") + repeat(2, "        X X X   ") + "    X X     X X     XX XX X X   ",
            ms: "@ls",
            hs: "@ls",
            re: repeat(2, "X X X X X  XX                   ") + repeat(2, "XX XX           ") + "X X     X X     X X XX XX X X",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
	},
        'Wolf Break': {
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
        'Hardcore Break': {
            ls: repeat(2, '              XXX             XXX             XXX       XXXXXXXX') + repeat(2, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
            ms: '@ls',
            hs: '@ls',
            re: repeat(1, '              XXX             XXX             XXX       XXXXXXXX') + repeat(3, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
            sn: '@re',
            ta: '@re',
            ag: repeat(3, 'o o o o o o o ooo o o o o o o ooo o o o o o o ooo o o o oooooooo') + repeat(1, 'a a a a a a a aaa a a a a a a aaa a a a a a a aaa a a a aaaaaaaa'),
            volumeHack: {
                ls: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
                ms: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
                hs: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
                re: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
                sn: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
                ta: { 66: .3, 78: 1, 82: .3, 94: 1, 98: .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 }
            }
        }
    }
}
