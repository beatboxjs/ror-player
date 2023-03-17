export default {
    categories: ["standard", "common", "easy"],
    sheet: require("./karla.pdf"),
    description: require("./karla-shnikov.md").default,
    video: "https://tube.rhythms-of-resistance.org/videos/embed/cc4d0222-3713-4943-bba1-cc733cb84ccc",
    patterns: {
        Tune: {
            loop: true,
            ls: 'X     XX        X     XX        X     XX        X     XX X XX X ',
            ms: '    X       X       X       X       X       X       X  X X XX X ',
            hs: '@ms',
            re: 'X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X ',
            sn: '....X.......X.......X.......X.......X.......X.......X.......X...',
            ta: '    X       X       X  X X XX       X       X       X  X X XX   ',
            ag: 'o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o ',
            sh: '................................................................'
        },
        'Karla Break (Karla)': {
            ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               ',
            ms: '@ls',
            hs: '@ls',
            re: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  XX  X X XX X ',
            sn: '@ls',
            ta: "X X X X X X X X X X X X X X X X X X X X X X X X X",
            ag: "o o o o o o o o o o o o o o o o o o o o o o o o o",
            volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1 }
        },            
        'Break 2': {
            ls: 'XXXXXXXXXXXXXXXXX   X   X   X   X X    X X      X X    X X      ',
            ms: '@ls',
            hs: '@ls',
            re: 'XXXXXXXXXXXXXXXXX   X   X   X       X      XXXX     X      XXXX ',
            sn: '@re',
            ta: '@re',
            ag: '@re',
            sh: '@re'
        },
        'Break 2 Inverted': {
            ls: 'XXXXXXXXXXXXXXXXX   X   X   X   X X    X X      X X    X X      X X    X X      X X    X X      X   X   X   X   XXXXXXXXXXXXXXXX',
            ms: '@ls',
            hs: '@ls',
            re: 'XXXXXXXXXXXXXXXXX   X   X   X       X      XXXX     X      XXXX     X      XXXX     X      XXXX X   X   X   X   XXXXXXXXXXXXXXXX',
            sn: '@re',
            ta: '@re',
            ag: '@re',
            sh: '@re'
        }
    },
    exampleSong: ["Tune", "Karla Break (Karla)", "Tune", "Break 2", "Tune", "Break 2 Inverted", "Tune"]
}
