import { sheetUrl } from "../../src/tuneHelper"
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
            ls: 's   s   s   s   s   s   X   X   ',
            ms: '      X       X       X   XXXXX ',
            hs: '@ms',
            re: 'f  hs r f  hs r f  hs r s r s r ',
            sn: 'X...X..XX..X....X...X..XX..X....',
            ta: 'X X X X XX XX X X X X X XX XX X ',
            ag: 'a a o o aa o oo a a o o aa o oo ',
            sh: '................................'
        },
        "Break 3": {
            ls: 's   s   s   s   s   s   X   X   ',
            ms: '   XXXX    XXXX    XXXX X XXXXX ',
            hs: '@ms',
            re: 'f  hs r f  hs r f  hs r s r s r ',
            sn: 'X...X..XX..X....X...X..XX..X....',
            ta: 'X X X X XX XX X X X X X XX XX X ',
            ag: 'a a o o aa o oo a a o o aa o oo ',
            sh: '................................'
        },
        "Bra Break": {
            displayName: "Call Break",
            ls: '        XX XX           XX XX           XX XX   X X X X XX XX X ',
            ms: '@ls',
            hs: '@ls',
            re: 'X X X           X X X           X X X           X X X X XX XX X ',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        "Tamborim Stroke": {
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
    exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tamborim Stroke"]
}