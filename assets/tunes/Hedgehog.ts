import { sheetUrl } from "../../src/tuneHelper";

export default {
    categories: ["standard", "uncommon", "easy"],
    sheet: sheetUrl + "hedgehog.pdf",
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
        'Alt Repi': {
            loop: true,
            re: '  XX XXX  XX XXX  XX XXX  XX  XX'
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
