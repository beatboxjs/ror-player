import { repeat  } from "../../src/tuneHelper"
export default {
    categories: ["common", "medium"],
    sheet: require("./custard.pdf"),
    description: require("./custard.md").default,
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
        ">  Low Surdo": {
            loop: true,
            ls: '0   X   0   X X ',
            sh: 'X   .   .   .'
        },
        ">  Mid Surdo": {
            loop: true,
            ms: 'X   0   X   0   ',
            sh: 'X   .   .   .'
        },
        ">  High Surdo": {
            loop: true,
            hs: 'X X 0   XX X0   ',
            sh: 'X   .   .   .'
        },
        ">  Repi": {
            loop: true,
            re: '  XX  XX  XX  XX',
            sh: 'X   .   .   .'
        },
        ">  Snare": {
            loop: true,
            sn: 'X.X.X..X.X..X...',
            sh: 'X   .   .   .   '
        },
        ">  Tam": {
            loop: true,
            ta: 'X X XX X X X XX ',
            sh: 'X   .   .   .   '
        },
        ">  Agogo": {
            displayName: '>  Agogô',
            loop: true,
            ag: 'a a oo a a o oo ',
            sh: 'X   .   .   .   '
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
        }
    },
    exampleSong: [ { tuneName: "General Breaks", patternName: "Whistle in" }, "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3 (Agogô continues)", "Tune", "Tune", "Tune", "Tune", "Break 5"]
}
