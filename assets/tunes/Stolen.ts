import { repeat } from "../../src/tuneHelper";

export default {
    categories: ["common", "tricky"],
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
            ag: "                              o  a     a  o",
            sh: "@sn"
        },
        ">  Low Surdo": {
            loop: true,
            ls: "X  X  X  X  X  X  X  X  X",
            sh: 'X     .     .     .     X     .     .     .     '
        },
        ">  Mid/High Surdo": {
            loop: true,
            ms: "      X           X           X  X     X  X     ",
            hs: '@ms',
            sh: 'X     .     .     .     X     .     .     .     '
        },
        ">  Repi": {
            loop: true,
            re: ".  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .",
            sh: 'X     .     .     .     X     .     .     .     '
        },
        ">  Snare": {
            loop: true,
            sn: ".  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
            sh: 'X     .     .     .     X     .     .     .     '
        },
        ">  Tam": {
            loop: true,
            ta: "X           X           X        X  X     X",
            sh: 'X     .     .     .     X     .     .     .     '
        },
        ">  Agogo": {
            displayName: '>  Agogô',
            loop: true,
            ag: "                              o  a     a  o",
            sh: 'X     .     .     .     X     .     .     .     '
        },
        "Whistle in (Stolen)": {
            ot: 'y           y           y     y     y     y     '
        },
        "Break 1": {
            ls: "                                          X                                               X                                               X                                               X           X                 X                 X     ",
            ms: "@ls",
            hs: "@ls",
            re: "X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X           XXX               XXX               XXX",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
        },
        "2/4 Break": {
            ls: "X           X           X     X     X     X     ",
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
        },
        "4 Hits (Stolen)": {
            ls: repeat(4, "X     "),
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
        },
        "8 Hits (Stolen)": {
            ls: repeat(8, "X     "),
            ms: "@ls",
            hs: "@ls",
            re: "@ls",
            sn: "@ls",
            ta: "@ls",
            ag: "@ls"
        },
        "Progressive Karla (Stolen)": {
            ls: "X     X     X     X     X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X                       ",
            ms: "@ls",
            hs: "@ls",
            re: "X     X     X     X     X  X  X  X  X  X  X  X  f  f  f  f  f  f  f  f  X",
            sn: "@re",
            ta: "@ls",
            ag: "@ls"
        }
    },
    exampleSong: ["2/4 Break", "Tune", "Tune", "Tune", "Tune", "8 Hits (Stolen)", "Tune", "Tune", "Tune", "Tune", "Break 1",
                  "Tune", "Tune", "Tune", "Tune", "Progressive Karla (Stolen)", "Tune", "Tune", "Tune", "Tune", "2/4 Break"]
}
