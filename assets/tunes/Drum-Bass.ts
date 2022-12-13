import { sheetUrl } from "../../src/tuneHelper";

export default {
    categories: ["standard", "common", "medium", "western"],
    sheet: sheetUrl + "drum-bass.pdf",
    displayName: "Drum & Bass",
    description: require("./drum-bass.md").default,
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
}