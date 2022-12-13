import { repeat, sheetUrl, stretch } from "../../src/tuneHelper";

export default {
    categories: ["standard", "common", "medium", "cultural-appropriation"],
    sheet: sheetUrl + "samba-reggae.pdf",
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
        'Bra Break': {
            displayName: "Call Break",
            ls: '          X X             X X             X X                                                                 X ',
            ms: '          X X             X X             X X                                                                   ',
            hs: '@ms',
            re: 'f XX XX X       f XX XX X       f XX XX X                                                                       ',
            sn: '          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...',
            ta: '          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
            ag: '@ms',
            sh: '@ms'
        },
        'Break 1': {
            ls: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ',
            ms: '@ls',
            hs: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX',
            re: 'XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ',
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
        'Break 3': {
            ls: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ',
            ms: '@ls',
            hs: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX',
            re: '                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ',
            sn: 'X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...',
            ta: '                                X  X  X   X                     X  X  X   X                 X X             X X                 ',
            ag: '                                X  X  X   X                     X  X  X   X                 a a             a a                 ',
            sh: '                                X  X  X   X                     X  X  X   X                                                     '
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
        'Knock On The Door Break': {
            time: 12,
            ls: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        'Knock On The Door (Cut)': {
            time: 12,
            ls: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
            ms: '@ls',
            hs: '@ls',
            re: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X X XX X X X XX '),
            sn: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        'Dancing Break': {
            ls: repeat(3, 'X  X   XX   X                   ') + 'X  X   XX   X                 X ',
            ms: repeat(4, 'X  X   XX   X                   '),
            hs: '@ls',
            re: repeat(4, '                X  X   XX   X   '),
            sn: '@re',
            ta: '@re',
            ag: '@re',
            sh: '@re'
        }
    },
    exampleSong: ["Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune", "Tune", "Tune", "Tune", "Knock On The Door Break", "Knock On The Door (Cut)", "Tune", "Tune", "Tune", "Tune", "Dancing Break", "Tune", "Tune", "Tune", "Tune"]
}