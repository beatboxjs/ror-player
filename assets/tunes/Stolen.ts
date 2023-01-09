export default {
    categories: ["standard", "common", "tricky"],
    time: 12,
    sheet: require("./stolen.pdf"),
    description: require("./stolen.md").default,
    video: undefined,
    patterns: {
        Tune: {
            loop: true,
            ls: "X  X  X  X  X  X  X  X  X",
            ms: "      X           X           X  X     X  X     ",
            hs: "@ms",
            re: ".  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .",
            sn: ".  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
            ta: "X           X           X        X  X     X",
            ag: "                              o  a     a  o"
        },
        "Break 1": {
            ls: "                                          X                                               X                                               X                                               X           X                 X                 X     ",
            ms: "@ls",
            hs: "@ls",
            re: "X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X           XXX               XXX               XXX",
            sn: "@ls",
            ta: "@ls",
            ag: "                                          o                                               o                                               o                                               o           o                 o                 o     "
        },
        "2/4 Break": {
            ls: "X           X           X     X     X     X     ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o           o           o     o     o     o"
        },
        "4 Hits (Stolen)": {
            ls: "X     X     X     X     ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "o     o     o     o "
        },
        "Progressive Karla (Stolen)": {
            ls: "X     X     X     X     X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X                       ",
            ms: "@ls",
            hs: "@ls",
            re: "X     X     X     X     X  X  X  X  X  X  X  X  f  f  f  f  f  f  f  f  X",
            sn: "@re",
            ta: "@ls",
            ag: "o     o     o     o     o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o"
        }
    },
    exampleSong: ["2/4 Break", "Tune", "Tune", "4 Hits (Stolen)", "Tune", "Tune", "Break 1",
                  "Tune", "Tune", "Progressive Karla (Stolen)", "Tune", "Tune", "2/4 Break"]
}
