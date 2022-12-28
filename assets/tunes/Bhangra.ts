import { crescendo, decrescendo, sheetUrl } from "../../src/tuneHelper"
export default {
    categories: ["standard", "common", "onesurdo", "medium"],
    speed: 120,
    time: 3,
    displayName: "Bhangra",
    sheet: sheetUrl + "bhangra.pdf",
    description: require("./bhangra.md").default,
    video: "https://tube.rhythms-of-resistance.org/videos/embed/bb1e9a2e-ce51-435c-818f-d98cf95f9ed0",
    patterns: {
        Tune: {
            loop: true,
            ls: 'X       XX  X       XX  X       XX  X    X   X  ',
            ms: '@ls',
            hs: '@ls',
            re: 'X zX zX zX zX zX zX zX zX zX zX zX zXXXX  XXXX  ',
            sn: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..',
            ta: 'X XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX X',
            ag: 'aaaa  oooo              aaaa  oooo              ',
            sh: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..'
        },
        'Break 1': {
            upbeat: 4,
            ls: 'XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X    X   X              ',
            ms: '@ls',
            hs: '@ls',
            re: '                   X  X                    X  X                    X  X                             ',
            sn: '                   X  X                    X  X                    X  X                 XXXX  XXXX  ',
            ta: '@re',
            ag: '@re',
            sh: '@re'
        },
        'Break 2': {
            upbeat: 4,
            ls: 'XX  X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X              ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: 'XX  X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X  XXXX  XXXX  ',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        "Break 3": {
            ls: "XXXX  XXXX  ",
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        "Bra Break": {
            displayName: "Call Break",
            ls: '                                                                        X XX XX XX              ',
            ms: '@ls',
            hs: '@ls',
            re: 'XXXXXXXXXX              XXXXXXXXXX              XXXX        XXXXXXXXXX              XXXXXXX     ',
            sn: '            XXXXXXXXXX              XXXXXXXXXX        XXXX                          XXXXXXX     ',
            ta: '@sn',
            ag: '@sn',
            sh: '@sn',
            ot: '                                                                                             F  '
        },
        "Karla Break (3⁄4)": {
            ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls',
            volumeHack: { 0: .1, 12: .4, 24: .7, 36: 1 }
        },
        "8 up (3⁄4)": {
            ls: 'XXXXXXXXXXXXXXXXXXXXXXXX',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls',
            volumeHack: crescendo(24)
        },
        "8 down (3⁄4)": {
            ls: 'XXXXXXXXXXXXXXXXXXXXXXXX',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls',
            volumeHack: decrescendo(24)
        },
        'Progressive (3⁄4)': {
            ls: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXX',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        'Progressive Inverted (3⁄4)': {
            ls: 'XXXXXXXXXXXXX XX XX XX XX  X  X  X  ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        'Progressive Karla (3⁄4)': {
            ls: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXXX           ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        }
    },
    exampleSong: ["Tune", "Break 1", "Tune", "Break 2", "Tune", "Break 3", "Tune", "Bra Break", "Tune"]
}