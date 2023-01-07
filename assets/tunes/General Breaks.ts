import { crescendo, decrescendo, repeat, stretch, sheetUrl } from "../../src/tuneHelper";

export default {
    categories: ["standard", "common", "uncommon", "new", "proposed", "custom", "onesurdo", "easy", "medium", "tricky", "western", "cultural-appropriation"],
    sheet: sheetUrl + "breaks.pdf",
    video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
    patterns: {
        'Silence': {
            ls: repeat(16, ' ')
        },
        'Silence 2x': {
            ls: repeat(32, ' ')
        },
        'Silence 4x': {
            ls: repeat(64, ' ')
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
            ls: 'X  X  X   X X   X  X  X   X X   ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls'
        },
        "Clave 4x": {
            displayName: "Clave 4x soft to loud",
            ls: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1 }
        },
	'4 Hits': {
            ls: "X   X   X   X   ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o   o   o   o"
	},
	'8 Hits': {
            ls: "X   X   X   X   X   X   X   X   ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o   o   o   o   o   o   o   o"
	},
	'Broccoli': {
            ls: "            X   ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "            o"
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
        'Karla Break': {
            ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: "X X X X X X X X X X X X X X X X X X X X X X X X X",
            ag: "o o o o o o o o o o o o o o o o o o o o o o o o o",
            volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1 }
        },
        'Progressive Karla': {
            ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXXX               ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: 'X   X   X   X   X X X X X X X X X X X X X X X X X',
            ag: 'o   o   o   o   o o o o o o o o o o o o o o o o o'
        },
        'Capped Karla': {
            loop: true,
            sn: 'XXXXXXXXXXXXXXXXX               '
        },
        'X Break': {
            ls: "X       X       X X X X X       X       X       X X X X X       X       X       X X X X X       X       X       X X X X X",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o       o       o o o o o       o       o       o o o o o       o       o       o o o o o       o       o       o o o o o",
            ot: "  A A A   A A A             A     A A A   A A A             A     A A A   A A A             A     A A A   A A A             A   "
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
        'Bunny Ears': {
            ls: "                X X X X X  XX                   X X X X X  XX           X X X           X X X       X X     X X     XX XX X X   ",
            ms: "@ls",
            hs: "@ls",
            re: "X X X X X  XX                   X X X X X  XX                   XX XX           XX XX           X X     X X     X X XX XX X X",
            sn: "@ls",
            ta: "@ls",
            ag: "                o o o o o  oo                   o o o o o  oo           o o o           o o o       o o     o o     oo oo o o"
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
            ag: "o o     o o o o o   o o o o   o   o o o o o   o",
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
        'Whistle in': {
            ot: 'y       y       y   y   y   y   '
        },
        'Whistle in (short)': {
            ot: 'y   y   y   y   '
        },
        'Whistle in (long)': {
            ot: 'y               y               y       y       y   y   y   y   '
	}
    }
}
