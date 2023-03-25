import { repeat } from "../../src/tuneHelper";

export default {
    categories: ["common", "onesurdo", "tricky"],
    sheet: require("./sambasso.pdf"),
    description: require("./sambasso.md").default,
    video: "https://tube.rhythms-of-resistance.org/videos/embed/f75a6a4e-121a-4170-aaf4-2e96a7eed95e",
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
        "   All Surdos": {
            loop: true,
            ls: 'X  rX r X  rX r ',
            ms: '@ls',
            hs: '@ls',
            sh: 'X   .   .   .   '
        },
        "   Repi": {
            loop: true,
            re: 'X..X..X..XX..XX.',
            sh: 'X   .   .   .'
        },
        "   Snare": {
            loop: true,
            sn: 'X..X..X...X..X..',
            sh: 'X   .   .   .   '
        },
        "   Tam": {
            loop: true,
            ta: 'X X X   XX XX   ',
            sh: 'X   .   .   .   '
        },
        '   Alt Tam': {
            loop: true,
            ta: ' X XX X XX XX  X X XXXX X  XX   ',
            sh: 'X   .   .   .   X   .   .   .   '
        },
        "   Agogo": {
            displayName: '   Agogô',
            loop: true,
            ag: 'o  aa oo a oo a ',
            sh: 'X   .   .   .   '
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
    exampleSong: ["Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Call Break (Intro)"]
}
