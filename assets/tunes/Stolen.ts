export default {
    categories: ["standard", "common", "tricky"],
    sheet: undefined,
    description: require("./stolen.md").default,
    video: undefined,
    patterns: {
        Tune: {
            "ls": " X  X  X  X  X  X  X  X  X                       X  X  X  X  X  X  X  X  X                       X  X  X  X  X  X  X  X  X                       X  X  X  X  X  X  X  X  X",
            "ms": "@ls",
            "hs": " X           X           X        X  X     X     X           X           X        X  X     X     X           X           X        X  X     X     X           X           X        X  X     X",
            "re": " .  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  X  X  .  X  .  .  X  .  .  X  .  X  .  .  X  .  .  X  .",
            "sn": " .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
            "ta": " X        X        X     X        X        X  X  X        X        X     X        X        X  X  X        X        X     X        X        X  X  X        X        X     X        X        X  X",
            "ag": " o     a  o     a  o     o     a  o  o     a     o     a  o     a  o     o  a  a  o  o     a     o     a  o     a  o     o     a  o  o     a     o     a  o     a  o     o  a  a  o  o     a",
            "sh": "@sn",
            "time": 12,
            "length": 16
        },
        "Break 1": {
            "ls": "                                           X                                               X                                               X                                               X           X                 X                 X",
            "ms": "@ls",
            "hs": "@ls",
            "re": " X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X             X X X X X X X X X X X X X   X     X           XXX               XXX               XXX",
            "sn": " .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
            "ta": "@ls",
            "ag": "                                           o                                               o                                               o                                               o           o                 o                 o",
            "time": 12,
            "length": 20
        },
        "Intro": {
            "ls": "                                           X",
            "ms": "@ls",
            "hs": "@ls",
            "re": "zX  X     X     X     X     XX X  X  X",
            "sn": "                                                 .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .  X  .",
            "ta": "@ls",
            "ag": "                                           o",
            "time": 12,
            "length": 20
        },
        "Outro": {
            "ls": " X",
            "ms": " X",
            "hs": " X",
            "re": " X",
            "sn": " X",
            "ta": " X",
            "ag": " o",
            "time": 12,
            "length": 4
        }
    },
    exampleSong: ["Intro", "Break 1", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 1", "Outro"]
}