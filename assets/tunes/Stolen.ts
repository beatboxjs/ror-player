export default {
    categories: ["standard", "common", "tricky"],
    sheet: undefined,
    description: require("./stolen.md").default,
    video: undefined,
    patterns: {
        Tune: {
            loop: true,
            ls: "XXXXXXXXX",
            ms: "  X   X   XX XX",
            hs: "@ms",
            re: "..X...X...X..XX.",
            sn:"..X...X...X...X.",
            ta: "X   X   X  XX X",
            ag: "          oa ao"
        },
        "Break 1": {
            time: 12,
            ls: "                                          X                                               X                                               X                                               X           X                 X                 X ",
            ms: "@ls",
            hs: "@ls",
            re: "X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X           XXX               XXX               XXX",
            sn: "@ls",
            ta: "@ls",
            ag: "                                          o                                               o                                               o                                               o           o                 o                 o "
        },
        "24 Break": {
            displayName: '2/4 Break',
            ls: "X   X   X X X X ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o   o   o o o o "
        },
        "4 Hits (Stolen)": {
            ls: "X X X X ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o o o o "
        },
        "Progressive Karla (Stolen)": {
            ls: "X X X X XXXXXXXXXXXXXXXXX       ",
            ms: "@ls",
            hs: "@ls",
            re: "X X X X XXXXXXXXffffffffX",
            sn: "@re",
            ta: "@ls",
            ag: "o o o o ooooooooooooooooo"
        }
    },
    exampleSong: ["24 Break", "Tune", "Tune", "4 Hits (Stolen)", "Tune", "Tune", "Break 1", "Tune", "Tune", "Progressive Karla (Stolen)", "Tune", "Tune", "24 Break"]
}
