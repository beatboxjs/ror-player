import { crescendo, decrescendo, sheetUrl } from "../../src/tuneHelper"
export default {
    categories: ["standard", "common", "onesurdo", "medium"],
    speed: 120,
    time: 3,
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
            sn: 'X..X..X..X..X..X..X..X..X..X..X..X..XXXX  XXXX',
            ta: 'X XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX X',
            ag: 'aaaa  oooo              aaaa  oooo              ',
            sh: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..'
        },
        'Break 1': {
            upbeat: 4,
            ls: 'XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X    X   X  XXXX  XXXX  ',
            ms: '@ls',
            hs: '@ls',
            re: '                   X  X                    X  X                    X  X                 XXXX  XXXX  ',
            sn: '@re',
            ta: '@re',
            ag: '@re',
            sh: '@re'
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
        '7 Break': {
            ls: "XXXXXXX",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "ooooooo",
            ot: "         A  "
        },
        'Butterfly Break': {
            ls: "XXXXXXX     XXXXXXX     XXXXXXXXXX  XXXXXXX",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "ooooooo     ooooooo     oooooooooo  ooooooo",
            ot: "                                             A  "
        },
        "Call Break": {
            ls: '                                                                        X XX XX XX              ',
            ms: '@ls',
            hs: '@ls',
            re: 'XXXXXXXXXX              XXXXXXXXXX              XXXX        XXXXXXXXXX              XXXXXXX     ',
            sn: '            XXXXXXXXXX              XXXXXXXXXX        XXXX                          XXXXXXX     ',
            ta: '@sn',
            ag: '@sn',
            sh: '@sn',
            ot: '                                                                                             A  '
        },
        'Break 2': {
            upbeat: 4,
            ls: 'XX  X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X  XXXX  XXXX  ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        "Karla Break (Bhangra)": {
            ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: 'x xx xx xx xx xx xx xx xx xx xx xx xx',
            ag: 'o oo oo oo oo oo oo oo oo oo oo oo oo',
            sh: '@ls',
            volumeHack: { 0: .1, 12: .4, 24: .7, 36: 1 }
        },
        'Progressive Karla (Bhangra)': {
            ls: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXXX           ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: 'X  X  X  X  X XX XX XX XX XX XX XX XX           ',
            ag: 'o  o  o  o  o oo oo oo oo oo oo oo oo',
            sh: '@ls'
        }
    },
    exampleSong: ["Tune", "Break 1", "Tune", "Break 3", "Tune", "7 Break", "Tune", "Butterfly Break", "Tune", "Call Break", "Tune", "Progressive Karla (Bhangra)", "Tune", "Break 2"]
}
