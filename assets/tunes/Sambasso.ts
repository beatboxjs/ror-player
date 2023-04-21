import { repeat } from "../../src/tuneHelper";

export default {
    categories: ["common", "onesurdo", "tricky"],
    sheet: require("./sambasso.pdf"),
    description: require("./sambasso.md").default,
    video: undefined,
    patterns: {
        Tune: {
            loop: true,
            ls: 'X  rX r X  rX r ',
            ms: '@ls',
            hs: '@ls',
            re: 'X..X..X..XX..XX.',
            sn: 'X..X..X...X..X..',
            ta: 'X X X   XX XX   ',
            ag: 'o  aa oo a oo a ',
            sh: 'X.X.X.X.X.X.X.X.'
        },
        'Alt Tam': {
            loop: true,
            ta: ' X XX X XX XX  X X XXXX X  XX   ',
            sh: 'X   .   .   .   X   .   .   .   '
        },
        'Break 1': {
            ls: 'X  rX r XX XX   ',
            ms: '@ls',
            hs: '@ls',
            re: 'X..X..X.XX XX   ',
            sn: 'X..X..X.XX XX   ',
            ta: 'X X X   XX XX   ',
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
            sh: '@re'
        },
        'Call Break (Intro)': {
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
    exampleSong: [ { tuneName: "General Breaks", patternName: "Whistle in" }, "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Call Break (Intro)"]
}
