export default {
    categories: ["common", "medium"],
    sheet: require("./angela-davis.pdf"),
    description: require("./angela-davis.md").default,
    video: "https://tube.rhythms-of-resistance.org/videos/embed/3a431ae3-e59b-4d31-b2d6-9abc4db3f242",
    patterns: {
        Tune: {
            loop: true,
            ls: 'X X r  rXrX r   ',
            ms: 'XXXXXXXXX       ',
            hs: '            XXXX',
            re: 'f   f   f  XXX  ',
            sn: '....X.......X...',
            ta: 'X   X  XXX  X   ',
            ag: '  o a   oa  a   ',
            sh: '................'
        },
        ">  Low Surdo": {
            loop: true,
            ls: 'X X r  rXrX r   ',
            sh: 'X   .   .   .   '
        },
        ">  Mid Surdo": {
            loop: true,
            ms: 'XXXXXXXXX       ',
            sh: 'X   .   .   .   '
        },
        ">  High Surdo": {
            loop: true,
            hs: '            XXXX',
            sh: 'X   .   .   .   '
        },
        ">  Repi": {
            loop: true,
            re: 'f   f   f  XXX  ',
            sh: 'X   .   .   .'
        },
        ">  Snare": {
            loop: true,
            sn: '....X.......X...',
            sh: 'X   .   .   .   '
        },
        ">  Tam": {
            loop: true,
            ta: 'X   X  XXX  X   ',
            sh: 'X   .   .   .   '
        },
        ">  Agogo": {
            displayName: '>  Agogô',
            loop: true,
            ag: '  o a   oa  a   ',
            sh: 'X   .   .   .   '
        },
        'Break 1': {
            upbeat: 1,
            ls: 'XX X X X X X X X ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '@ls',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        },
        'Break 2': {
            ls: 'X             X X             X X              XX X X X X X X X ',
            ms: '@ls',
            hs: '@ls',
            re: '  XXX XX XX X     XXX XX XX X     XXX XX XX X  XX X X X X X X X ',
            sn: '@re',
            ta: '@re',
            ag: '@re',
            sh: '@re'
        },
        'Break 3': {
            loop: true,
            ls: 'X     XXXX      X X X  X        X     XXXX        X  X  X      XX X X X X X X X ',
            ms: '@ls',
            hs: '@ls',
            re: '@ls',
            sn: '....X.......X.......X.......X.......X.......X.......X.......X.......X.......X...',
            ta: '@ls',
            ag: '@ls',
            sh: '@ls'
        }
    },
    exampleSong: ["Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Break 3", "Tune", "Tune", "Tune", "Tune"]
}
