import { repeat, sheetUrl } from "../../src/tuneHelper"
export default {
    displayName: "Afoxé",
    categories: ["standard", "common", "medium", "cultural-appropriation"],
    sheet: sheetUrl + "afoxe.pdf",
    description: require("./afoxe.md").default,
    patterns: {
        "Tune": {
            loop: true,
            ls: 's   s   s   s   s   s   X   X   ',
            ms: '0     X 0     X 0     X X X X X ',
            hs: '@ms',
            re: 'f  hs r f  hs r f  hs r s r s r ',
            sn: 'X...X..XX..X....X...X..XX..X....',
            ta: 'X X X X XX XX X X X X X XX XX X ',
            ag: 'a a o o aa o oo a a o o aa o oo ',
            sh: '................................'
        },
        "Break 1": {
            ls: 'X       X       X       X XXXXX ',
            ms: '@ls',
            hs: '@ls',
            re: '   XXXX    XXXX    XXXX X XXXXX ',
            sn: '@re',
            ta: '@re',
            ag: '@re',
            sh: '@re'
        },
        "Break 2": {
            ls: '      X       X       X   XXXXX ',
            ms: '@ls',
            hs: '@ls',
            re: 'f  hs r f  hs r f  hs r s r s r ',
            sn: 'X...X..XX..X....X...X..XX..X....',
            ta: 'X X X X XX XX X X X X X XX XX X ',
            ag: 'a a o o aa o oo a a o o aa o oo ',
            sh: '................................'
        },
        "Break 3": {
            ls: '   XXXX    XXXX    XXXX X XXXXX ',
            ms: '@ls',
            hs: '@ls',
            re: 'f  hs r f  hs r f  hs r s r s r ',
            sn: 'X...X..XX..X....X...X..XX..X....',
            ta: 'X X X X XX XX X X X X X XX XX X ',
            ag: 'a a o o aa o oo a a o o aa o oo ',
            sh: '................................'
        },
        "Short call": {
            displayName: 'Call Break (short)',
            loop: true,
            ls: '        XX XX           XX XX           XX XX   X X X X XX XX X ',
            ms: '@ls',
            hs: '@ls',
            re: 'X X X           X X X           X X X           X X X X XX XX X ',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        "Long call": {
            displayName: 'Call Break (long)',
            ls: repeat(3, repeat(2, '                                ') + '        XX XX   ') + '        XX XX           XX XX   X X X X XX XX X ',
            ms: '@ls',
            hs: '@ls',
            re: repeat(3, repeat(2, 'f  hs r f  hs r f  hs r s r s r ') + 'X X X           ') + 'X X X           X X X           X X X X XX XX X ',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        "Tam Stroke": {
            ls: 'X X X X XX XX X ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        }
    },
    exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Long call", "Tune", "Tune", "Tam Stroke","Tune", "Tune", "Break 2","Tune", "Tune", "Break 3",]
}
