angular.module("ror-simulator").constant("RorTunes", {
	'General Breaks': {
		patterns: {
			/*"Kalashnikov": {
				ls: '{v30}XXXXXXXXXXXXXXXX{v50}XXXXXXXXXXXXXXXX{v70}XXXXXXXXXXXXXXXX{v100}X               ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			"8 up": {
				ls: '{v7}X{v10}X{v13}X{v16}X{v19}X{v22}X{v25}X{v28}X{v31}X{v34}X{v37}X{v40}X{v43}X{v46}X{v49}X{v52}X{v55}X{v58}X{v61}X{v64}X{v67}X{v70}X{v73}X{v76}X{v79}X{v82}X{v85}X{v88}X{v91}X{v94}X{v97}X{v100}X',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}*/
			"Clave": {
				ls: 'X  X  X   X X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '$ls',
				sh: '@ls'
			},
			'Clave Inverted': {
				ls: '  X X   X  X  X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		}
	},
	'Bhangra': {
		time: 3,
		patterns: {
			Tune: {
				ls: 'X       XX  X       XX  X       XX  X    X   X  ',
				ms: '@ls',
				hs: '@ls',
				re: 'X XX XX XX XX XX XX XX XX XX XX XX XXXXX  XXXX  ',
				sn: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..',
				ta: 'X XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX X',
				ag: 'aaaa  oooo              aaaa  oooo              ',
				sh: 'X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  X  '
			},
			'Break 1': {
				ls: 'X XX X  XX  X       XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X    X   X              ',
				ms: '@ls',
				hs: '@ls',
				re: '               X  X                    X  X                    X  X                             ',
				sn: '               X  X                    X  X                    X  X                 XXXX  XXXX  ',
				ta: '@re',
				ag: '@re'
			},
			'Break 2': {
				ls: 'X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X              ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: 'X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X  XXXX  XXXX  ',
				ta: '@ls',
				ag: '@ls'
			},
			"Break 3": {
				ls: "XXXX  XXXX  ",
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			}
		}
	},
	'Crazy Monkey': {
		patterns: {
			Tune: {
				time: 12,
				ls: 'X                       X                       X                       X     X  X              ',
				ms: '                  X                       X                       X     X     X  X        X     ',
				hs: '         X  X  X  X  X           X  X  X  X  X           X  X  X  X  X  X     X  X              ',
				re: 'f        h  X     X  X  f        h  X     X  X  f        h  X     X  X  X     X  X              ',
				sn: '.  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  X  .  X  X  .  .        ',
				ta: '      X  X        X        X     X        X           X  X        X        X     X              ',
				ag: 'o     a  a  a     o  o     a     a  a     o  o  o     a  a  a     o  o      a   a   a   a   a   ',
				sh: 'X     X     X     X     X     X     X     X     X     X     X     X     X     X  X              '
			}
		}
	},
	'Drum&Bass': {
		patterns: {
			Tune: {
				ls: 'X         X  X  X         X     X         X  X  X         X     ',
				ms: '      XXXX            XXXX            XXXX            XXXX      ',
				hs: '    X       X       X       X       X       X       X       X   ',
				re: '    X  X X XX XX    X       X       X  X X XX XX    X       X   ',
				sn: '....X..X....X.......X..X....X   ....X..X....X...X.X.X.X.X.X.X.X.',
				ta: '    X     X X       X   X X X       X     X X       X   X X X   ',
				ag: 'o ao ao a       o ao ao a       o ao ao a       o ao ao a       '
			},
			'Break 2': {
				ls: 'X  X X  X  X X  X  X X          ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X   X   X   X   X XXXX    ',
				sn: '@re',
				ta: '  X   X   X   X   X   X         ',
				ag: '@ta'
			},
			'Break 3': {
				ls: 'X     X   X  X  X     X   X  X  X     X   X  X  ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls'
			},
			'Progressive Break': {
				ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXX',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls'
			},
			'Hip-Hop Break': {
				ls: 'X  X     X X    X  X   X X X  X X  X     X X                    X  X     X X    X  X   X X X  X X  X     X X                    ',
				ms: '@ls',
				hs: '@ls',
				re: '    X       X       X       X       X       X   Xr Xr Xr Xr XXrr    X       X       X       X       X       X                   ',
				sn: '    X       X       X       X       X       X                       X       X       X       X       X       X     X   X   X   X ',
				ta: '    X       X       X       X       X       X                       X       X       X       X       X       X                   ',
				ag: '    o       o       o       o       o       o                       o       o       o       o       o       o                   '
			}
		}
	},
	'Funk': {
		patterns: {
			Tune: {
				ls: 'X  X  X X X     X  X  X X       ',
				ms: '@ls',
				hs: '@ls',
				re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
				sn: '....X.......X.......X.......X...',
				ta: '    X       X X     X     X X   ',
				ag: 'o  a  o   a a a o  a  o   a a a ',
				sh: 'X X X X X X X X X X X X X X X X '
			},
			"Break 1": {
				ls: 'X X     X X   X X X     X       X X     X X   X X X     X       ',
				ms: '@ls',
				hs: '@ls',
				re: '    X X     X       X X   X   X     X X     X       X X   XXX   ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			"Break 2": {
				ls: 'X X X X X X X X ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: 'o o o o o o o o ',
				sh: '@ls'
			}
		}
	},
	'Hafla': {
		patterns: {
			Tune: {
				ls: 'X       X       X X     X       ',
				ms: '  X   X     X         X     X   ',
				hs: '    X   X   X       X   X   X   ',
				re: 'r X   X r   X   r X XXr r   X XX',
				sn: '..X...X.....X.....X.XXX.....X.XX',
				ta: 'X X   X X   X XXX X   X X   X   ',
				ag: 'o a   a o   a     a   a o   a   '
			},
			'Yala Break': {
				ls: 'X X   X X   X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls'
			},
			'Kick Back 1': {
				ls: 'X       X       ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X     X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re'
			},
			'Break 3': {
				ls: '    X       X       X X     X   ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: 'XXXX            XXXX    XXXX    ',
				ta: '@ls',
				ag: '@ls'
			},
			'Hook Break': {
				ls: 'X X     X       X       X X     X   X   X   X   X       X       ',
				ms: '@ls',
				hs: '@ls',
				re: '   XXX    XXX XX  XXXXX     X XX  XX  XX  XX  XX  X   X     X   ',
				sn: '@re',
				ta: '@re',
				ag: '@re'
			}
		}
	},
	'Ragga': {
		patterns: {
			Tune: {
				ls: 'X  X  0 X  X  0 X  X  0 X  X  0 ',
				ms: '0  X  X 0  X  X 0  X  X 0  X  X ',
				hs: '0     X 0     X 0     X 0     X ',
				re: '  X   X   X   X   X   X  XXX  X ',
				sn: '..XX..X...XX..X...XX..X...XX..X.',
				ta: '  X   X   X   X   X   X   XX  X ',
				ag: 'o a o a oa ao a o a  oooo a o   ',
				sh: 'X X X X X X X X X X X X X X X X '
			},
			'Kick Back 1': {
				ls: 'X  X    X  X    X  X    X  X    ',
				ms: '@ls',
				hs: '@ls',
				re: '      X       X       X       X ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Kick Back 2': {
				ls: 'X  X X  X  X X  X  X X  X  X X  ',
				ms: '@ls',
				hs: '@ls',
				re: '  X   X   X   X   X   X   X   X ',
				sn: '@re',
				ta: '@re',
				ag: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
				sh: '@re'
			},
			'Break 2': {
				ls: 'X           XXX ',
				ms: '@ls',
				hs: '@ls',
				re: '@ls',
				sn: '@ls',
				ta: '@ls',
				ag: '@ls',
				sh: '@ls'
			},
			'Break 3': {
				ls: 'X  X  X         ',
				ms: '@ls',
				hs: '@ls',
				re: '        X  X  X ',
				sn: '@re',
				ta: '@re',
				ag: '@re',
				sh: '@re'
			},
			'Zorro-Break': {
				ls: 'X       X       X       X  X  X ',
				ms: '@ls',
				hs: '@ls'
			}
		}
	}
});