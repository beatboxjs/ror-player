export default {
    categories: ["core", "common", "easy"],
    sheet: require("./funk.pdf"),
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
        ">  Low Surdo": {
            loop: true,
            ls: 'X  X  X X X     X  X  X X       ',
            sh: 'X   .   .   .   X   .   .   .   '
        },
        ">  Mid/High Surdo, Tam": {
            loop: true,
            ms: '    X       X X     X     X X   ',
            hs: '@ms',
            ta: '@ms',
            sh: 'X   .   .   .   X   .   .   .   '
        },
        ">  Repi": {
            loop: true,
            re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
            sh: 'X   .   .   .   X   .   .   .   '
        },
        ">  Alt Repi": {
            loop: true,
            re: '  X   X XXXXX X   X   X X XX XX ',
            sh: 'X   .   .   .   X   .   .   .   '
        },
        ">  Snare": {
            loop: true,
            sn: '....X.......X...',
            sh: 'X   .   .   .   '
        },
        ">  Agogo": {
            displayName: '>  Agogô',
            loop: true,
            ag: 'o  a  o   a a a ',
            sh: 'X   .   .   .   '
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
            ag: '@ls',
            sh: '@ls'
        }
    },
    exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune"]
}
