export default {
    categories: ["new", "medium"],
    sheet: require("./drum-bass.pdf"),
    displayName: "Drum & Bass",
    description: require("./drum-bass.md").default,
    patterns: {
        Tune: {
            loop: true,
            ls: 'X         X  X  X         X     X         X  X  X         X     ',
            ms: '    X XXXX  X       X XXXX  X       X XXXX  X       X XXXX  X   ',
            hs: '@ms',
            re: '    X  X X XX XX    X       X       X  X X XX XX    X       X   ',
            sn: '....X..X....X.......X..X....X   ....X..X....X...X.X.X.X.X.X.X.X.',
            ta: '    X     X X       X   X X X       X     X X       X   X X X   ',
            ag: 'o ao ao a       o ao ao a       o ao ao a       o ao ao a       ',
            sh: '................................................................'
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
        'Call Break': {
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
    exampleSong: [ { tuneName: "General Breaks", patternName: "Whistle in" }, "Tune", "Break 2", "Tune", "Call Break", "Tune"]
}
