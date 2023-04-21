import { repeat, stretch } from "../../src/tuneHelper";

export default {
    categories: ["core", "common", "medium"],
    sheet: require("./samba-reggae.pdf"),
    description: require("./samba-reggae.md").default,
    patterns: {
        Tune: {
            loop: true,
            ls: '0   X   0   X X ',
            ms: 'X   0   X   0   ',
            hs: '0     X 0   XXXX',
            re: '  XX  XX  XX  XX',
            sn: 'X..X..X...X..X..',
            ta: 'X  X  X   X X   ',
            ag: 'o a a oo a aa o ',
            sh: '................'
        },
        'Break 1': {
            ls: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX',
            ms: '@ls',
            hs: '@ls',
            re: 'XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX               XXXX',
            sn: '                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        'Break 2': {
            ls: '            XXXX            XXXX            XXXX            XXXX',
            ms: '@ls',
            hs: '@ls',
            re: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        'Whistle Break': {
            loop: true,
            time: 12,
            ls: "X         X X         X X   X     X X",
            ms: "@ls",
            hs: "@ls",
            re: "      X           X           X           X  ",
            sn: "@re",
            ta: "@re",
            ag: "@re",
        },
        'Break 3': {
            ls: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ',
            ms: '@ls',
            hs: '@ls',
            re: '                                X  X  X   X                     X  X  X   X              fX X X          fX X X             XXXX',
            sn: 'X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...',
            ta: '                                X  X  X   X                     X  X  X   X                 X X             X X             XXXX',
            ag: '                                X  X  X   X                     X  X  X   X                 a a             a a             aaaa',
            sh: '                                X  X  X   X                     X  X  X   X                                                 XXXX'
        },
        'Call Break': {
            ls: '          X X             X X             X X                                                                 X ',
            ms: '          X X             X X             X X                                                                   ',
            hs: '@ms',
            re: 'f XX XX X       f XX XX X       f XX XX X                                                                       ',
            sn: '          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...',
            ta: '          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
            ag: '@ms',
            sh: '@ms'
        },
        'SOS Break': {
            ls: 'X       X       X       X       X       X       X       X     X ',
            ms: 'X       X       X       X       X       X       X       X       ',
            hs: '@ms',
            re: '  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ',
            sn: '@re',
            ta: '@re',
            ag: '@re',
            sh: '@re'
        },
        'Tune (SOS Repi)': {
            loop: true,
            ls: '0   X   0   X X ',
            ms: 'X   0   X   0   ',
            hs: '0     X 0   XXXX',
            re: '  XX XX   X X   ',
            sn: 'X..X..X...X..X..',
            ta: 'X  X  X   X X   ',
            ag: 'o a a oo a aa o ',
            sh: '................'
        }
    },
    exampleSong: [ { tuneName: "General Breaks", patternName: "Whistle in" }, "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Whistle Break", "Whistle Break", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "Call Break", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune (SOS Repi)", "Tune (SOS Repi)", "Tune (SOS Repi)", "Tune (SOS Repi)"]
}
