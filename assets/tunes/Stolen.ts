export default {
    categories: ["standard", "common", "tricky"],
    time: 12,
    sheet: undefined,
    description: require("./stolen.md").default,
    video: undefined,
    patterns: {
        Tune: {
            loop: true,
            ls: "X  X  X  X  X  X  X  X  X",
            ms: "      X           X           X  X     X  X",
            hs: "@ms",
            re: ".  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .",
            sn: ".  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
            ta: "X           X           X        X  X     X",
            ag: "                              o  a     a  o "
        },
        "Break 1": {
            ls: "                                          X                                               X                                               X                                               X           X                 X                 X ",
            ms: "@ls",
            hs: "@ls",
            re: "X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X           XXX               XXX               XXX",
            sn: "@ls",
            ta: "@ls",
            ag: "                                          o                                               o                                               o                                               o           o                 o                 o "
        },
        "2/4 Break": {
            ls: "X   X   X X X X ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o   o   o o o o "
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
    exampleSong: ["2/4 Break", "Tune", "Tune", "Break 1", "Tune", "Tune", "Progressive Karla (Stolen)", "Tune", "Tune", "Break 1", "2/4 Break"]
}
