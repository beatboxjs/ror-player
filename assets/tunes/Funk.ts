import { sheetUrl } from "../../src/tuneHelper";

export default {
    categories: ["standard", "common", "onesurdo", "easy"],
    sheet: sheetUrl + "funk.pdf",
    description: require("./funk.md").default,
    patterns: {
        Tune: {
            loop: true,
            ls: 'X  X  X X X     X  X  X X       ',
            ms: '    X       X X     X     X X   ',
            hs: '@ms',
            re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
            sn: '....X.......X.......X.......X...',
            ta: '@ms',
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
        "Alt Repi": {
            loop: true,
            re: '  X   X XXXXX X   X   X X XX XX '
        }
    },
    exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune"]
}
