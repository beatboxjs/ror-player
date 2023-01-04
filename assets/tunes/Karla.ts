import { sheetUrl } from "../../src/tuneHelper";

export default {
    categories: ["standard", "common", "onesurdo", "easy"],
    sheet: sheetUrl + "karla-shnikov.pdf",
    description: require("./karla-shnikov.md").default,
    video: "https://tube.rhythms-of-resistance.org/videos/embed/cc4d0222-3713-4943-bba1-cc733cb84ccc",
    patterns: {
        Tune: {
            loop: true,
            ls: 'X     XX        X     XX        X     XX        X     XX X XX X ',
            ms: '    X       X       X       X       X       X       X  X X XX X ',
            hs: '@ms',
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
}
