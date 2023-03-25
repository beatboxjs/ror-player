export default {
    categories: ["core", "common", "easy"],
    sheet: require("./hedgehog.pdf"),
    description: require("./hedgehog.md").default,
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
        "   Low Surdo": {
            loop: true,
            ls: 's  X    s  X    s  X    X X X X ',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        "   Mid Surdo": {
            loop: true,
            ms: '      XX      XX      XX      XX',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        "   High Surdo": {
            loop: true,
            hs: '   X  X    X  X    X  X   X   X ',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        "   Repi": {
            loop: true,
            re: 'r  X  X r  X  X r  X  X r X r X ',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        '   Alt Repi': {
            loop: true,
            re: '  XX XXX  XX XXX  XX XXX  XX  XX',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        "   Snare": {
            loop: true,
            sn: 'X..X..X.X..X..X.X..X..X.X...X...',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        "   Tam": {
            loop: true,
            ta: 'X  X    X  X    X  X    X X X   ',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        "   Agogo": {
            displayName: '   Agogô',
            loop: true,
            ag: 'o  a  a o  a  a o  a  a o a o a ',
            sh: 'X   .   .   .   X   .   .   .    '
        },
        'Break 2': {
            ls: 'X               ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            ot: '        A   A   '
        }
    },
    exampleSong: ["Tune", "Tune", "Break 2", "Tune", "Tune"]
}
