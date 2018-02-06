angular.module("beatbox").factory("bbDefaultTunes", function(ng, $rootScope, bbConfig, bbTune, bbPattern, $) {
	function stretch(from, to, pattern) {
		return pattern.split("").concat([ "" ]).join(repeat((to/from)-1, " "));
	}

	function repeat(n, pattern) {
		var ret = "";
		for(var i=0; i<n; i++)
			ret += pattern;
		return ret;
	}

	function crescendo(length) {
		var r = { };
		var a = .05;
		var b = (1-a)/(length-1);
		for(var i=0; i<length; i++)
			r[i] = a+b*i;
		return r;
	}

	var bbDefaultTunes = {
		'General Breaks': {
			categories: [ "common", "uncommon", "new", "proposed", "custom" ],
			patterns: {
				"Karla Break": {
					ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
				},
				"8 up": {
					ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: crescendo(32)
				},
				"Clave": {
					ls: 'X  X  X   X X   ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
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
				},
				'Silence': {
					ls: '                '
				},
				'Progressive': {
					ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXX',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Progressive Karla': {
					ls: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXXX               ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'4 Silence': {
					ls: repeat(16, ' ')
				},
				'8 Silence': {
					ls: repeat(32, ' ')
				},
				'12 Silence': {
					ls: repeat(48, ' ')
				},
				'16 Silence': {
					ls: repeat(64, ' ')
				}
			}
		},
		'Special Breaks': {
			categories: [ "common" ],
			patterns: {
				"Call Break Oi": {
					time: 3,
					ls: 'X  XXXX     ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: '         A  '
				},
				"Call Break Ua": {
					time: 3,
					ls: 'X  XXXX     ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: '         B  '
				},
				'Star Wars': {
					ls: '            X       X           ',
					ms: 'X   X   X       X       X       ',
					hs: '               X       X        '
				},
				'Star Wars Extended': {
					ls: '            X       X                               X           ',
					ms: 'X   X   X       X       X                       X       X       ',
					hs: '               X       X                       X       X        ',
					re: '                                X   X   X                       ',
					ta: '                                            X                   '
				},
				"Wulf Break": {
					ls: 'X X   XXX X    XX X    XX X     X X   XXX X    XX X X X X       ',
					ms: '@ls',
					hs: '@ls',
					re: '    X       X       X       X       X       X  XX X X X X       ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re',
					ot: '                                                          E D   '
				},
				'Hard Core Break': {
					ls: repeat(2, '              XXX             XXX             XXX       XXXXXXXX') + repeat(2, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
					ms: '@ls',
					hs: '@ls',
					re: repeat(1, '              XXX             XXX             XXX       XXXXXXXX') + repeat(3, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
					sn: '@re',
					ta: '@re',
					ag: repeat(3, 'o o o o o o o ooo o o o o o o ooo o o o o o o ooo o o o oooooooo') + repeat(1, 'a a a a a a a aaa a a a a a a aaa a a a a a a aaa a a a aaaaaaaa'),
					volumeHack: {
						66:  .1, 78:  1, 82:  .1, 94:  1, 98:  .1, 110: 1, 114: .1, 120: 1,
						130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1
					}
				},
				'Tout le monde': {
					ls: 'X     X X     X X  XX X X   X   ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: 'b     c d     e g  qj k m   n   '
				}
			}
		},
		"Afoxe": {
			displayName: "Afoxê",
			categories: [ "common" ],
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
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
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
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
				},
				"Break 3": {
					ls: 's   s   s   s   s   s   X   X   ',
					ms: '   XXXX    XXXX    XXXX X XXXXX ',
					hs: '@ms',
					re: 'f  hs r f  hs r f  hs r s r s r ',
					sn: 'X...X..XX..X....X...X..XX..X....',
					ta: 'X X X X XX XX X X X X X XX XX X ',
					ag: 'a a o o aa o oo a a o o aa o oo ',
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
				},
				"Bra Break": {
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
			}
		},
		'Angela Davis': {
			categories: [ "common" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'X X X  XXXX X   ',
					ms: 'XXXXXXXXX       ',
					hs: '            XXXX',
					re: 'f   f   f  XXX  ',
					sn: '....X.......X...',
					ta: 'X   X  XXX  X   ',
					ag: '  o a   oa  a   ',
					sh: 'XXXXXXXXXXXXXXXX'
				},
				'Break 1': {
					ls: 'X X X X X X X X ',
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
					sh: '@ls'
				},
				'Break 3': {
					ls: 'X     XXXX      X X X  X        X     XXXX        X  X  X      XX X X X X X X X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '....X.......X.......X.......X.......X.......X.......X.......X.......X.......X...',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				}
			}
		},
		'Angry Dwarfs': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 's   X   s   X   ',
					ms: 'X  XX  XX  XX X ',
					hs: '@ms',
					re: '  f  f    f  f  ',
					sn: '..XX..X...XX..X.',
					ta: '  X   X   X X X ',
					ag: 'a  ao  ao a a   ',
					sh: 'X..XX..XX..XX..X'
				},
				'Intro': {
					ls: repeat(4, '                ') + repeat(3, '        XX XX X ') + '    X       X   ',
					ms: repeat(4, '                ') + repeat(3, '        XX XX X ') + 'X       X   X X ',
					hs: repeat(4, '                ') + repeat(3, '        XX XX X ') + '            X X ',
					re: repeat(4, '                ') + repeat(3, 'XX XX X         ') + '  X   X   X X X ',
					sn: repeat(4, '                ') + repeat(3, '        XX XX X ') + '                ',
					ta: repeat(8, '  X   X   X X X '),
					ag: '@sn',
					sh: '@sn'
				},
				'No-Cent-For-Axel-Break': {
					ls: '        XX XX X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: '98 76 5         '
				},
				'Tension Break': {
					ls: '    X       X       X   XX XX X ',
					ms: '  X   X   X   X   X   X XX XX X ',
					hs: '                        XX XX X ',
					re: '@hs',
					ta: 'XX XX X         XX XX X XX XX X ',
					ag: '@hs',
					sh: '@hs'
				}
			}
		},
		'Bhangra': {
			categories: [ "common" ],
			speed: 120,
			time: 3,
			patterns: {
				Tune: {
					loop: true,
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
					ag: '@re',
					sh: '@re'
				},
				'Break 2': {
					ls: 'X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X              ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: 'X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X  XXXX  XXXX  ',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
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
				},
				"Bra Break": {
					ls: '                                                                        X XX XX XX              ',
					ms: '@ls',
					hs: '@ls',
					re: 'XXXXXXXXXX              XXXXXXXXXX              XXXX        XXXXXXXXXX              XXXXXXX     ',
					sn: '            XXXXXXXXXX              XXXXXXXXXX        XXXX                          XXXXXXX     ',
					ta: '@sn',
					ag: '@sn',
					sh: '@sn',
					ot: '                                                                                             F  '
				},
				"Karla Break (3⁄4)": {
					ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: { 0: .1, 12: .4, 24: .7, 36: 1  }
				},
				"8 up (3⁄4)": {
					ls: 'XXXXXXXXXXXXXXXXXXXXXXXX',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: crescendo(24)
				},
				'Progressive (3⁄4)': {
					ls: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXX',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Progressive Karla (3⁄4)': {
					ls: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXXX           ',
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
		'Cochabamba' : {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'XX  0    XX 0   XX  0    XX 0   ',
					ms: '@ls',
					hs: '    0 XX    0 XX    0 XX    0 XX',
					re: '  XX  X   XX  X   XX  XX  XX  X ',
					sn: '....X.......X.......X.......X...',
					ta: '@re',
					ag: 'aa.oo.aa.oo.a.a.oo.aa.oo.aa.o.o.',
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
				},
				'Break 1': {
					ls: 'XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: { 0: .2, 16: .6, 32: 1  }
				},
				'Bra Break (Maestra)': {
					ls: '            X X             X X             X X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: 'ww ww ww ww     ww ww ww ww     ww ww ww ww     '
				},
				'Bra Break (Repi)': {
					ls: '            X X             X X             X X ',
					ms: '@ls',
					hs: '@ls',
					re: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Bra Break (Snare)': {
					ls: '            X X             X X             X X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Cross Kicks': {
					ls: 'XX  0       0   ',
					hs: '    0       0 XX'
				}
			}
		},
		'Crazy Monkey': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					time: 12,
					ls: 'X                       X                       X                       X     X  X              ',
					ms: '                  X                       X                       X     X     X  X        X     ',
					hs: '         X  X  X  X  X           X  X  X  X  X           X  X  X  X  X  X     X  X              ',
					re: 'f        h  X     X  X  f        h  X     X  X  f        h  X     X  X  X     X  X              ',
					sn: '.  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  X  .  X  X  .  .        ',
					ta: '      X  X        X        X     X        X           X  X        X        X     X              ',
					ag: 'o     a  a  a     o  o     a     a  a     o  o  o     a  a  a     o  o      a   a   a   a   a   ',
					sh: 'X     X     X     X     X     X     X     X     X     X     X     X     X     X  X              '
				},
				"Break 1": {
					ls: '        X XX            X XX          X X     X X   X   X XX    ',
					ms: '        X XX            X XX          X X     X X   X   X XX  X ',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: 'o aaa oo      o o aaa oo      o o aaa   o aaa   o aao aao       ',
					sh: '@ls'
				},
				"Break 2": {
					ls: '        X XX            X XX        X XX    X XX        X XX    ',
					ms: '        X XX            X XX        X XX    X XX        X XX  X ',
					hs: '@ls',
					re: '@ls',
					sn: '....X.XXX.XX........X.XXX.XX........X.XX....X.XX....X.XXX.XX    ',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				"Break 3": {
					ls: 'X XX    X XX    X XXX XXX XX    ',
					ms: 'X XX    X XX    X XXX XXX XX  X ',
					hs: '@ls',
					re: '      X       X X XXX XXX XX    ',
					sn: '@re',
					ta: '@re',
					ag: '      X       X o aoo aoo oo  a ',
					sh: '@re'
				},
				"Bongo Break 1": {
					loop: true,
					ls: 'X   X   X   X   X   X   X XX    ',
					ms: '@ls',
					hs: '@ls',
					re: '   X  X  X X  X    X  X       X ',
					sn: '@re',
					ta: '@re',
					ag: 'o  ao a oa ao a o  ao a o oo  a ',
					sh: '@re'
				},
				"Bongo Break 2": {
					loop: true,
					ls: 'X   X   X   X   X   X   X XX  X ',
					ms: '@ls',
					hs: '@ls',
					re: 'X XX XX X XX XX X XX XX       X ',
					ta: '@re',
					ag: 'o  ao a oa ao a o  ao a o oo  a ',
					sh: '@re'
				},
				"Monkey Break": {
					ot: 'D  D  D E  E  E '
				}
			}
		},
		'Custard': {
			categories: [ "common" ],
			patterns: {
				Tune: {
					loop: true,
					ls: '0   X   0   X X ',
					ms: 'X   0   X   0   ',
					hs: 'X X 0   XX X0   ',
					re: '  XX  XX  XX  XX',
					sn: 'X.X.X..X.X..X...',
					ta: 'X X XX X X X XX ',
					ag: 'a a oo a a o oo ',
					sh: 'XXXXXXXXXXXXXXXX'
				},
				'Break 1': {
					ls: repeat(3, 'X X XX          ') + 'X X XX X X X XX ',
					ms: '@ls',
					hs: '@ls',
					re: repeat(3, '       X X X XX ') + 'X X XX X X X XX ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Break 2': {
					ls: repeat(3, '       X X X XX ') + 'X X XX X X X XX ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@re',
					ta: repeat(3, 'X X XX          ') + 'X X XX X X X XX ',
					ag: '@ls',
					sh: '@ls'
				},
				'Break 3' : {
					ls: repeat(4, 'X             X X               '),
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: repeat(3, 'X             X X               ') + 'X             X X.X.X..X.X..XXXX',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Break 5': {
					ls: '              X X             X X     X X     X X   X   X   X   ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: 'X.X.X..X.X..X     X.X..X.X..X     X X     X X     X   X   X   X ',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Singing Break': {
					ot: '4 3 21 C H I M! '
				}
			}
		},
		'Drum&Bass': {
			categories: [ "common" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'X         X  X  X         X     X         X  X  X         X     ',
					ms: '      XXXX            XXXX            XXXX            XXXX      ',
					hs: '    X       X       X       X       X       X       X       X   ',
					re: '    X  X X XX XX    X       X       X  X X XX XX    X       X   ',
					sn: '....X..X....X.......X..X....X   ....X..X....X...X.X.X.X.X.X.X.X.',
					ta: '    X     X X       X   X X X       X     X X       X   X X X   ',
					ag: 'o ao ao a       o ao ao a       o ao ao a       o ao ao a       ',
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
				},
				'Break 1': {
					time: 2,
					ot: 'TUVWY Z '
				},
				'Break 2': {
					ls: 'X  X X  X  X X  X  X X          ',
					ms: '@ls',
					hs: '@ls',
					re: '  X   X   X   X   X   X XXXX    ',
					sn: '@re',
					ta: '  X   X   X   X   X   X         ',
					ag: '@ta',
					sh: '@ta'
				},
				'Break 3': {
					ls: 'X     X   X  X  X     X   X  X  X     X   X  X  ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Hip-Hop Break': {
					ls: 'X  X     X X    X  X   X X X  X X  X     X X                    X  X     X X    X  X   X X X  X X  X     X X                    ',
					ms: '@ls',
					hs: '@ls',
					re: '    X       X       X       X       X       X   Xr Xr Xr Xr XXrr    X       X       X       X       X       X                   ',
					sn: '    X       X       X       X       X       X                       X       X       X       X       X       X     X   X   X   X ',
					ta: '    X       X       X       X       X       X                       X       X       X       X       X       X                   ',
					ag: '@ta',
					sh: '@ta'
				}
			}
		},
		'Drunken Sailor': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'X   X   X X     X   X   X X     X   X   X X             X   X   ',
					ms: 'X   X   X   X   X   X   X   X   X   X   X   X       X X         ',
					hs: 'X   X   X     X X   X   X     X X   X   X     X X X             ',
					re: 'f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r ',
					sn: 'X..XX..XX.......X..XX..XX.X.X.X.X..XX..XX.......X..XX..XX.X.X.X.',
					ta: 'XX      X X X   XX      X X X   XX      X X X   XX      X X X   ',
					ag: 'o oao oao o a o o oao oao o a o o oao oao o a o o oao oao o a o '
				},
				'Break 1': {
					ls: 'X X XX  X   X   ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Break 2': {
					ls: 'X   X   X   XXX ',
					ms: '@ls',
					hs: '@ls',
					re: '  X   X   X XXX ',
					sn: '@re',
					ta: '@re',
					ag: '@re'
				},
				'White Shark': {
					ls: 'X               X       X               X       X       X       X   X   X   X   X   X   X   X   X   X   X   X   X       X       ',
					ms: '@ls',
					hs: '@ls',
					re: '   X               X       X               X       X       X      X   X   X   X   X   X   X   X   X   X   X   X   X     X       ',
					sn: '@re',
					ta: '@re',
					ag: '                                                                                ooa         ooa ooa         ooa                 '
				}
			}
		},
		'Funk': {
			categories: [ "common" ],
			patterns: {
				Tune: {
					loop: true,
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
				},
				"Tune (Variant 1)": {
					ls: 'X       X X   X X       X       ',
					ms: '@ls',
					hs: '@ls',
					re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
					sn: '....X.......X.......X.......X...',
					ta: '    X       X X   XXX   X X X   ',
					ag: 'o  a  o   a a a o  a  o   a a a ',
					sh: 'X X X X X X X X X X X X X X X X '
				},
				"Tune (Variant 2)": {
					ls: 'X X     X X   X X X     X       ',
					ms: '@ls',
					hs: '@ls',
					re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
					sn: '....X.......X.......X.......X...',
					ta: '    X       X X     X     X X   ',
					ag: 'o  a  o   a a a o  a  o   a a a ',
					sh: 'X X X X X X X X X X X X X X X X '
				}
			}
		},
		'Hafla': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
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
					loop: true,
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
		'Hedgehog': {
			categories: [ "uncommon" ],
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
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
				},
				'Break 1': {
					ls: 'X   X   X   X   ',
					ms: '@ls',
					hs: '@ls',
					re: 'r  X  X r X r X ',
					sn: 'X..X..X.X...X...',
					ta: 'X  X    X X X   ',
					ag: 'o  a  a o a o a ',
					sh: 'XXXXXXXXXXXXXXXX'
				},
				'Break 2': {
					ls: 'X               ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					ot: '        R   S   '
				}
			}
		},
		'Karla Shnikov': {
			categories: [ "common" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'X   0 XX    0   X   0 XX    0   X   0 XX    0   X   0 XX X XX X ',
					ms: '@ls',
					hs: '@ls',
					re: 'X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X ',
					sn: '....X.......X.......X.......X.......X.......X.......X.......X...',
					ta: '    X       X       X  X X XX       X       X       X  X X XX   ',
					ag: 'o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o ',
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
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
			}
		},
		'Menaiek': {
			categories: [ "uncommon", "new" ],
			patterns: {
				Tune: {
					loop: true,
					time: 12,
					ls: stretch(4, 12, 'X   z X X   z X X   z X X   z X '),
					ms: stretch(4, 12, '    z   X         z     X   X   '),
					hs: stretch(4, 12, 'X   z         X   z         X   '),
					re: stretch(4, 12, 'rrX z   f  f  f       Xhr Xhr Xh'),
					sn: stretch(4, 12, 'X..XX..XX..XX.X.X..XX..XX...X.X.'),
					ta: stretch(4, 12, 'X   X XXX X   f       f     ') + stretch(3, 12, 'XXX'),
					ag: stretch(4, 12, 'o   a a o     o   a   o o   o   ')
				},
				"Break 1": {
					ls: 'X X X XX X XX X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls'
				},
				"Break 2": {
					ls: repeat(3, '                      XXX XX  XX'),
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: repeat(3, 'o a o     o  a                  ') + 'o a o  o a oo o                 '
				},
				"Double Break": {
					ls: 'X z    X z    X ',
					ms: '  z X    z  X X ',
					hs: 'X hXX hXX hXX hX',
					re: 'r  rr  r r rr r ',
					sn: 'X..XX..XX..XX.X.',
					ta: 'X   X XXX X   f ',
					ag: 'o a o  o a oo oa'
				},
				"Kick Break": {
					loop: true,
					ls: 'X   X  X    X X ',
					ms: '@ls',
					hs: '@ls',
					re: '  X       X     ',
					sn: '@re',
					ta: '@re',
					ag: 'o a o  o a oo oa'
				},
				"Mozambique Break": {
					ls: '   i  h    i  h ',
					ms: '@ls',
					hs: '@ls',
					re: 'r r rr r rr rr r',
					sn: '@re',
					ta: '@re',
					ag: '@re'
				}
			}
		},
		'No Border Bossa': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 's   h X X   h s s   h X X X h s s   h X X   h s s   h X    h s ',
					ms: '@ls',
					hs: '@ls',
					re: '  X r   fh fh f   X r   fh fh f   X r   fh fh f   X r   fh fh f ',
					sn: 'X..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..X',
					ta: '  X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X ',
					ag: 'a a x o o o x a a a x o o o x a a a x o o o x a a a x o o o x a '
				},
				'Break 1': {
					ls: '  X X   X  X  X   X X   XX XX   ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls'
				},
				'Break 2': {
					ls: 's     s s     s s     s s     s ',
					ms: '@ls',
					hs: '@ls',
					re: '  X r   fh fh f   X r   fh fh f ',
					sn: 'X..XX..XX..XX..XX..XX..XX..XX..X',
					ta: '  X X   X  X  X   X X   X  X  X ',
					ag: 'a a . o o o . a a a . o o o . a '
				},
				/* TODO: volumeHack only for Surdo
				'Break 2*': {
					ls: 's     s s     s s     s s     s ',
					ms: '@ls',
					hs: '@ls',
					re: '  X r   fh fh f   X r   fh fh f ',
					sn: 'X..XX..XX..XX..XX..XX..XX..XX..X',
					ta: '  X X   X  X  X   X X   X  X  X ',
					ag: 'a a x o o o x a a a x o o o x a ',
					volumeHack: crescendo(32)
				}*/
				'Bra Break': {
					ls: '                        XX XX   ',
					ms: '@ls',
					hs: '@ls',
					re: 'X X X   X  X  X   X X           ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls'
				}
			}
		},
		'Nova Balanca': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'X  X            ',
					ms: '     XX       X ',
					hs: '        X  X    ',
					re: 'XX  X       X   ',
					sn: '....X...XX..X...',
					ta: 'X  XX X X  XX X ',
					ag: 'o  oa o o  oa o ',
					sh: 'XXXXXXXXXXXXXXXX'
				},
				'Bra Break': {
					ls: '    X     X         X     X     ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: 'XXXXX XXXXX     XXXXX XXXXX     ',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Break 1': {
					ls: 'X X X X X X X X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: crescendo(16)
				},
				'Break 2': {
					ls: 'X X X X XX XX X ',
					ms: '@ls',
					hs: '@ls',
					re: '  X   X  X X  X ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				}
			}
		},
		'Orangutan': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: '    XXXX    XXXX',
					ms: 'X XX        XXXX',
					hs: '        X XX    ',
					re: 'X rrX rr rrrX r ',
					sn: '..XX..XX..XX..XX',
					ta: '  XX XX   XX XX ',
					ag: 'oa  o aa o  a oo'
				},
				"Funky gibbon" : {
					ls: 'X   X   X  XX X XX              X   X   X  XX X X               ',
					ms: '@ls',
					hs: '@ls',
					re: '  r   r   r   r   r   r   r   r   r   r   r   r   r   r   r   r ',
					sn: '..X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X.',
					ta: '@re',
					ag: '@re'
				},
				"Monkey break" : {
					ls: '  XX XX   XX XX ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					ot: 'G       G       '
				},
				"Break 2": {
					ls: 'X   X       X   ',
					ms: '@ls',
					hs: '@ls',
					re: '  XX  XX XXX  X ',
					sn: '@re',
					ta: '@re',
					ag: '@re'
				}
			}
		},
		'Ragga': {
			categories: [ "common" ],
			patterns: {
				Tune: {
					loop: true,
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
					loop: true,
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
					loop: true,
					time: 12,
					ls: 'X        X     X        X        X     X        X        X     X        X        X     X        ',
					ms: '@ls',
					hs: '@ls',
					re: '      X           X           X           X           X           X           X           X     ',
					sn: '@re',
					ta: '@re',
					ag: 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa',
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
		},
		'Rope Skipping': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					time: 12,
					ls: stretch(4, 12, repeat(2, 'XXXXXXXXX   X               X X ')),
					ms: stretch(4, 12, repeat(2, '  ss       XX     ss       XX   ')),
					hs: stretch(4, 12, repeat(2, '            X X XXXXXXXXX   X   ')),
					re: stretch(4, 12, repeat(2, 's XXf   s XXf   s XXf   XXX f   ')),
					sn: stretch(4, 12, repeat(2, '....X.......X.......X..XX..XX...')),
					ta: stretch(4, 12, 'X  XX   X  XX   X  XX  XX  XX   X  XX   X  XX   X  XX   ') + stretch(3, 12, 'XXX   '),
					ag: stretch(4, 12, repeat(2, 'a  aa  oo  oo a a  aa  oo  oo a '))
				},
				'Oh Shit': {
					ls: 'X               ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: '        N   O   '
				},
				'Fuck Off': {
					ls: 'X               ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: '        P   Q   '
				},
				'Break 1': {
					ls: 'X      XX         X    XX       ',
					ms: '@ls',
					hs: '@ls',
					re: '    X     X         X     X X   ',
					sn: '@re',
					ta: '@re',
					ag: '@re'
				},
				'Break 2': {
					ls: 'XX  XX  XX  X     XX  XX  XX    ',
					ms: '@ls',
					hs: '@ls',
					re: '  XX  XX  XX    XX  XX  XX  X   ',
					sn: '@re',
					ta: '@re',
					ag: '@re'
				},
				'Break 3': {
					ls: 'X   X   X   X   ',
					ms: '@ls',
					hs: '@ls',
					re: ' XX  XX  XX     ',
					sn: '@re',
					ta: '@re',
					ag: '@re'
				},
				'Küsel Break': {
					ls: 'X XXX X X X X                   ',
					ms: '@ls',
					hs: '@ls',
					re: '                X XXX X X X X   ',
					sn: 'X..XX..XX...X.X.X.X.X.X.X.X.X...',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Skipping Agogo': {
					ag: 'a  aaa aa  aaaoao  ooo oo  oooao'
				},
				'I like to move it': {
					loop: true,
					re: '                X   X   X   X   ',
					ag: 'o   o   o   o a           a   a '
				},
				'Eye of the tiger': {
					time: 12,
					ls: stretch(4, 12, '                                              X                 '),
					ms: stretch(4, 12, '           X               X               X                    '),
					hs: stretch(4, 12, 'X       X     X         X     X         X                       '),
					sn: stretch(4, 12, '................................................                '),
					ag: stretch(4, 12, '                                                ') + 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa'
				}
			}
		},
		'Samba Reggae': {
			categories: [ "common" ],
			patterns: {
				Tune: {
					loop: true,
					ls: '0   X   0   X X ',
					ms: 'X   0   X   0   ',
					hs: '0     X 0   XXXX',
					re: '  XX  XX  XX  XX',
					sn: 'X..X..X...X..X..',
					ta: 'X  X  X   X X   ',
					ag: 'o a a oo a aa o ',
					sh: 'XXXXXXXXXXXXXXXX'
				},
				'Bra Break': {
					ls: '          X X             X X             X X                                                                 X ',
					ms: '          X X             X X             X X                                                                   ',
					hs: '@ms',
					re: 'f XX XX X       f XX XX X       f XX XX X                                                                       ',
					sn: '          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...',
					ta: '          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
					ag: '@ms',
					sh: '@ms'
				},
				'Break 1': {
					ls: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ',
					ms: '@ls',
					hs: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX',
					re: 'XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ',
					sn: '                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Break 2': {
					ls: '            XXXX            XXXX            XXXX            XXXX',
					ms: '@ls',
					hs: '@ls',
					re: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Break 3': {
					ls: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ',
					ms: '@ls',
					hs: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX',
					re: '                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ',
					sn: 'X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...',
					ta: '                                X  X  X   X                     X  X  X   X                 X X             X X                 ',
					ag: '                                X  X  X   X                     X  X  X   X                 a a             a a                 ',
					sh: '                                X  X  X   X                     X  X  X   X                                                     '
				},
				'SOS Break': {
					ls: 'X       X       X       X       X       X       X       X     X ',
					ms: 'X       X       X       X       X       X       X       X       ',
					hs: '@ms',
					re: '  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Knock On The Door Break': {
					time: 12,
					ls: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Knock On The Door (Cut)': {
					time: 12,
					ls: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
					ms: '@ls',
					hs: '@ls',
					re: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X X XX X X X XX '),
					sn: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Dancing Break': {
					ls: repeat(3, 'X  X   XX   X                   ') + 'X  X   XX   X                 X ',
					ms: repeat(4, 'X  X   XX   X                   '),
					hs: '@ls',
					re: repeat(4, '                X  X   XX   X   '),
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				}
			}
		},
	    "Samba Reggae High": {
			categories: [ "proposed" ],
		    patterns: {
				Tune: {
					loop: true,
					ls: "0   X   0   X X ",
					ms: "X   0   X   0   ",
					hs: "0     X 0   XXXX",
					re: "  XX  XX  XX  XX",
					sn: "X..X..X...X..X..",
					ta: "X XX XXX  X  X  ",
					ag: "o a a oo a aa o ",
					sh: "XXXXXXXXXXXXXXXX"
				},
				"Break 1": {
					ls: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ",
					ms: "@ls",
					hs: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX",
					re: "XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ",
					sn: "                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ",
					ta: "@ls",
					ag: "@ls",
					sh: "@ls"
				},
				"Break 2": {
					ls: "            XXXX            XXXX            XXXX            XXXX",
					ms: "@ls",
					hs: "@ls",
					re: "X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
					sn: "@ls",
					ta: "@ls",
					ag: "@ls",
					sh: "@ls"
				},
				"Break 3": {
					ls: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ",
					ms: "@ls",
					hs: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX",
					re: "                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ",
					sn: "X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...",
					ta: "                                X  X  X   X                     X  X  X   X                 X X             X X                 ",
					ag: "                                X  X  X   X                     X  X  X   X                 a a             a a                 ",
					sh: "                                X  X  X   X                     X  X  X   X                                                     "
				},
			    "Pickup": {
					hs: "            XXXX"
				},
				"Stop on 1": {
					ls: "X               ",
					hs: "@ls",
					re: "@ls",
					sn: "@ls",
					ta: "@ls",
					ag: "@ls",
					sh: "@ls"
				},
			    "Tam Entrada": {
					time: 3,
					ta: "XXXXXXXXXXXX",
			    },
			    "Tam “Bossa Mess About”": {
					time: 12,
					ta: stretch(4, 12, "X  X  X   X  X  X  X  X  XX  X  X  X  X  XX XX  X  X  X ") + stretch(3, 12, "XXXXXX"),
			    },
			    "Tam “Little Turn” Groove": {
					ta: "X   XXXXX       X X XXXXX       X X X   XXXXX   XX XX   XXXXX   "
			    }
		    }
		},
		"Samba Reggae Low": {
			categories: [ "proposed" ],
			patterns: {
				Tune: {
					loop: true,
					ls: "0   X   0   X   0   X   0   X   ",
					ms: "X   0   X   0   X   0   X   0   ",
					hs: "0     XX0     XX0     XX0 X XXXX",
					re: "  XX  XX  XX  XX  XX  XX  XX  XX",
					sn: "X..X..X...X.X...X..X..X...X.X...",
					ta: "X  X  X   X X   X  X  X   X X   ",
					ag: "o  a  o   a a   o  a  o   a a   ",
					sh: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
				},
				"Bra Break": {
					ls: "          X X             X X             X X                                                                 X ",
					ms: "          X X             X X             X X                                                                   ",
					hs: "@ms",
					re: "f XX XX X       f XX XX X       f XX XX X                                                                       ",
					sn: "          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...",
					ta: "          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
					ag: "@ms",
					sh: "@ms"
				},
				"SOS Break": {
					ls: "X       X       X       X       X       X       X       X     X ",
					ms: "X       X       X       X       X       X       X       X       ",
					hs: "@ms",
					re: "  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ",
					sn: "@re",
					ta: "@re",
					ag: "@re",
					sh: "@re"
				},
				"Knock On The Door Break": {
					time: 12,
					ls: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
					ms: "@ls",
					hs: "@ls",
					re: "@ls",
					sn: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
					ta: "@ls",
					ag: "@ls",
					sh: "@ls"
				},
				"Knock On The Door (Cut)": {
					time: 12,
					ls: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
					ms: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
					hs: "@ms",
					re: "X                                   X   X   X   X                                               X        X        X           X     X     X     X     X     X  X     X     X     X     X  X     ",
					sn: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
					ta: "@ms",
					ag: "@ms",
					sh: "@ms"
				},
				"Dancing Break": {
					ls: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                 X ",
					ms: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   ",
					hs: "@ms",
					re: "                X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X   ",
					sn: "@re",
					ta: "@re",
					ag: "@re",
					sh: "@re"
				},
				"Pickup": {
					ls: "              X "
				},
				"Stop on 1": {
					ls: "X               ",
					hs: "@ls",
					re: "@ls",
					sn: "@ls",
					ta: "@ls",
					ag: "@ls",
					sh: "@ls"
				},
				"Fancy Tam Line": {
					ta: repeat(2, "X  X  X   X X   X  X  X   X X   ") + repeat(2, "X  X  X   X X XXX  X  X XXX X   ")
				},
				"Fancy Tam Line 2": {
					ta: repeat(2, "X  X  X         X  X  X         ") + repeat(2, "X  X  X   XXX XXX  X  X         ")
				}
			}
		},
		'Sambasso': {
			categories: [ "uncommon", "new" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'X  tX t X  tX t X  tX t X  tX t ',
					ms: '@ls',
					hs: '@ls',
					re: 'X..X..X..XX..XX.X..X..X..XX..XX.',
					sn: 'X..X..X...X..X..X..X..X...X..X..',
					ta: ' X XX X XX XX  X X XXXX X  XX   ',
					ag: 'o  aa oo a oo a o  aa oo a oo a ',
					sh: 'X X X X X X X X X X X X X X X X '
				},
				'Break 1': {
					ls: 'X  tX t XX XX   ',
					ms: '@ls',
					hs: '@ls',
					re: 'X..X..X.XX XX   ',
					sn: 'X..X..X.XX XX   ',
					ta: ' X XX X XX XX   ',
					ag: 'o  aa ooXX XX   ',
					sh: 'X X X X XX XX   ',
					ot: 'y w w           '
				},
				'Break 2': {
					ls: 'X X X X X       ',
					ms: '@ls',
					hs: '@ls',
					re: '          XX XX ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Intro': {
					ls: '        XX XX           XX XX           XX XX           XX XX                       X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   ',
					ms: '@ls',
					hs: '@ls',
					re: 'X X X          fX X X          fX X X          fX X X           X..X..X..X..ffffX                               X..X..X..X..ffffX                               X..X..X..X..ffffX                               X..X..X..X..ffffX                               ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				}
			}
		},
		'Sheffield Samba Reggae': {
			categories: [ "uncommon", "new" ],
			patterns: {
				Tune: {
					loop: true,
					ls: '    X X     XXXX    X X     XXXX    X X     XXXX    X X     XXXX',
					ms: 'X       X       X       X       X       X       X       X       ',
					hs: '    X X     X X     X X X X XXXX    X X     X X     X X X X XXXX',
					sn: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
					re: '@sn',
					ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
					ag: 'o  a  o   a  a  o  a  o   a  a  o  a  o   a  a  o  a  o   a  a  '
				},
				'Intro': {
					ls: '                           XX X X             X X             X X             X XX X X X    X X ',
					ms: '@ls',
					hs: '@ls',
					re: 'X X X X X  XXXXXX X X X X          fXX X fXXX      fXX X fXXX      fXX X fXXX            fXX    ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls'
				},
				'Break 1': {
					loop: true,
					ls: 'X               X               X               X               ',
					ms: '@ms',
					hs: '@hs',
					sn: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
					re: '@sn',
					ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
					ag: 'o  a  o   a  a  o  a  o   a  a  o  a  o   a  a  o  a  o   a  a  '
				},
				'Break 2': {
					ls: 'X               X             X X               X               ',
					ms: '@ls',
					hs: '@ls',
					sn: 'XXrXXXrXXXrXX r XXrXXXrXXXrXX r XXrXXXrXXXrXXXrXX X X X fXX X X ',
					re: '@sn',
					ta: '  X   X   X   X   X   X   X   X   X   X   X   XXX X X X     X X ',
					ag: '@ta'
				},
				'Break 3': {
					ls: 'X  X  X         X  X  X         ',
					ms: '@ls',
					hs: '@ls',
					sn: '        X  X  X         XXXXX X ',
					re: '@sn',
					ta: '@sn',
					ag: '@sn'
				},
				'Whistle Break': {
					loop: true,
					ls: 'X  XX  XXX XX   ',
					ms: '@ls',
					hs: '@ls',
					sn: '  X   X   X   X ',
					re: '@sn',
					ta: '@sn',
					ag: '@sn'
				}
			}
		},
		'Tequila': {
			categories: [ "proposed" ],
			patterns: {
				Tune: {
					loop: true,
					ls: '     X   X     X     X         X',
					ms: 'X XX   X        X XX   X        ',
					hs: '    X               X           ',
					re: '    X      hX       X    X XrXh ',
					sn: '....X.......X.X.....X.......X...',
					ta: '    X       X X     X       X   ',
					ag: 'a a o  a a ao o a a o  a        ',
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
				},
				'Break 1': {
					ls: 'XXXX           X',
					ms: '    X X         ',
					hs: '        X       ',
					ag: 'aaaaa a o       ',
					ot: '           uv x '
				},
				'Break 2': {
					ls: repeat(3, '             X  '),
					ms: repeat(3, '       X      XX'),
					hs: repeat(3, 'X               '),
					sh: repeat(3, 'XXXXXXXX        ')
				},
				'Bra Break': {
					ls: '    X       X X ',
					ms: '@ls',
					hs: '@ls',
					re: 'X X    X X X    ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				}
			}
		},
		'The Sirens of Titan': {
			categories: [ "proposed" ],
			time: 3,
			speed: 120,
			patterns: {
				Tune: {
					loop: true,
					ls: 'X  X              X  X        X  X        XXXX  ',
					ms: '            X  X        X  X                    ',
					hs: '      XXXX                          X  X        ',
					re: repeat(4, 'X  X  X XX  '),
					sn: repeat(4, 'X..X..X..X..'),
					ta: 'XXXX        XXXX        XXXX  XXXX  XXXX        ',
					ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
					sh: repeat(4, 'X XX  X XX  ')
				},
				'Rented a Tent Break': {
					ls: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX      X  ',
					ms: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX   XXX   ',
					hs: '   X  X  X     X  X  X     X     X        XXX   ',
					re: 'XXXX XX XX  XXXX XX XX  XXXX  XXXX  XXX   XXXX  ',
					sn: 'XXXX.XX.XX..XXXX.XX.XX..XXXX..XXXX..XXX...XXXX..',
					ta: '@re',
					ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
					sh: '@re'
				}
			}
		},
		'Van Harte Pardon': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: '0     XX0     X 0     XX0   X X ',
					ms: '@ls',
					hs: 's  X    s  X    s  X    ss sX   ',
					re: '  X   X  X X  X   X   X  X X  X ',
					sn: 'X..X..X.X..X..X.X..X..X.X..X..X.',
					ta: '  X   X  X X  X   X   X  X X  X ',
					ag: 'a.ooo.aa.o.oo.ooo.aaa.oo.a.aa.oo',
					sh: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
				},
				'Break 1': {
					ls: '                XX XX XX        ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					ot: 'J   K   K   L               F   '
				},
				'Silence Break': {
					ls: '              XX',
					ag: '@ls'
				},
				'Break 2': {
					ls: 'X  s          X X  s          X ',
					hs: 'X  s            X  s            ',
					re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
					sn: '@re',
					ta: '      XXXX XX X       XXXX XX   ',
					ag: '      aaaa oa a       oooo ao   '
				},
				'Break 2 (Cut)': {
					ls: 'X  s          X X  s  ssss sX X ',
					hs: 'X  s            X  s  ssss sX   ',
					re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
					sn: '@re',
					ta: '      XXXX XX X       XXXX XX   ',
					ag: '      aaaa oa a       oooo ao   '
				},
				'Cross Break': {
					ls: 'X  s          X X  s          X ',
					hs: 'X  s            X  s            '
				},
				'Cross Eight Break': {
					ls: 'X X X X X X X X ',
					ms: '@ls',
					hs: '@ls',
					volumeHack: crescendo(16)
				}
			}
		},
		'Voodoo': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: '   XX 0    XX 0    XX 0 X X X 0 ',
					ms: 's   s X s   s X s   s X s   s X ',
					hs: '@ms',
					re: 'X  X  X X  X  X X  X  X X  X  X ',
					sn: 'X..X..X.X..X..X.X..X..X.X..X..X.',
					ta: 'X X X X X X X X XX              ',
					ag: 'a a o o oa a oo a a o o oa a oo ',
					sh: 'X       X       X       X       '
				},
				'Scissor Break': {
					ls: 'X X X X XX X XX ',
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
		'Walc(z)': {
			categories: [ "uncommon", "new" ],
			time: 6,
			speed: 60,
			patterns: {
				Tune: {
					loop: true,
					ls: 'X     X     X     X     ',
					ms: '  X X   X X   X X   XXXX',
					hs: '@ms',
					re: '  X X   XXX   X X   XXX ',
					sn: '..X.X...X.X...X.X.XXXXXX',
					ta: '  X X   X X       X X X ',
					ag: 'o a a o a a o a a o     ',
					sh: 'X X X X XXX X X X X XXX '
				},
				'Break 2': {
					ls: 'X X X                   ',
					ms: '      X X X             ',
					hs: '            X X X       ',
					re: '                  XXXXXX',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Break 3': {
					ls: 'X X X       X X X       X X   X X   X X X X     ',
					ms: '@ls',
					hs: '@ls',
					re: '      X           X         X     X X X X X     ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Break 5': {
					ls: '                  XXXXXX',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '..X.X...X.X...X.X.XXXXXX',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Bra Break': {
					ls: '      X           X         X     X     X X     ',
					ms: '@ls',
					hs: '@ls',
					re: 'X X X       X X X       X X   X X   X X         ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Cut-throat Break': {
					ls: 'X     X     X           ',
					ms: '@ls',
					hs: '@ls',
					re: '  X X   X X   X X       ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Cut-throat Break Fast': {
					ls: 'X  X  X     ',
					ms: '@ls',
					hs: '@ls',
					re: ' XX XX XX   ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				"Karla Break (6⁄4)": {
					ls: repeat(3, 'XXXXXXXXXXXXXXXXXXXXXXXX') + 'X                       ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: { 0: .1, 24: .4, 48: .7, 72: 1  }
				},
				"8 up (6⁄4)": {
					ls: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls',
					volumeHack: crescendo(48)
				},
				'Progressive (6⁄4)': {
					ls: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXX',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls',
					sh: '@ls'
				},
				'Progressive Karla (6⁄4)': {
					ls: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXXX                       ',
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
		'Wolf': {
			categories: [ "proposed" ],
			patterns: {
				Tune: {
					loop: true,
					ls: repeat(4, 'X   X   X   X   '),
					ms: repeat(4, '  XX     XXX    '),
					hs: repeat(2, '      XX      XX      XXXXXXXXXX'),
					re: repeat(2, 'X XX  r X X X rrX XX  r  XXXX rr'),
					sn: repeat(4, 'f.X...X...X...X.'),
					ta: 'X X     X X     XX XXX XX       X XX XX X X X X XX XXX XX       ',
					ag: repeat(4, 'ooooo a   a   a '),
					sh: repeat(4, 'XXXXXXXXXXXXXXXX')
				},
				'Pat 1': {
					ls: '              XXX     XXX       ',
					ms: '   X X     X X                  ',
					hs: 'XXXXXXXXX                       '
				},
				'Pat 2': {
					ls: '              XXX     XXX       ',
					ms: '   X X     X X                  ',
					hs: 'XXXXXXXXXXXXX                   '
				},
				'Break 1': {
					ls: '   XX  XX X X    XXXX  XX X X      XX  XX X X    XXXX  XX       ',
					ms: '@ls',
					hs: '@ls',
					sn: 'X               X               X               X               '
				},
				'Break 2': {
					ls: 'X X   XXX X    XX X    XX X     X X   XXX X    X X X X X        ',
					ms: '@ls',
					hs: '@ls',
					re: '    X       X       X       X       X       X  X X X X X        ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re',
					ot: '                                                            A   '
				}
			}
		},
		'Xango': {
			categories: [ "uncommon" ],
			patterns: {
				Tune: {
					loop: true,
					ls: repeat(2, 's   X XX        '),
					ms: repeat(2, 'X X             '),
					hs: repeat(2, '            XXXX'),
					re: repeat(2, ' XXX XXX XXX XXX'),
					sn: repeat(2, 'X..X....X.XX....'),
					ta: 'X X X X X X X X XX              ',
					ag: repeat(2, 'o a o  o o ao   '),
					sh: repeat(2, 'XXXXXXXXXXXXXXXX')
				},
				'Intro': {
					ls: 'X         X X X X           X X X       X X X X X           X   ',
					ms: '@ls',
					hs: '@ls',
					re: repeat(4, 'r rrr r r r r r '),
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Boum Shakala Break': {
					ls: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X                 ',
					ms: '@ls',
					hs: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X             XXXX',
					re: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X                 ',
					sn: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X X..X..XXX       ',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				},
				'Break 2': {
					ls: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   ',
					ms: '@ls',
					hs: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX XX',
					re: '                         X XX                            X XX                            X XX   ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					sh: '@re'
				}
			}
		},
		'Zurav Love / Truant': {
			displayName: "Żurav Love / Truant",
			categories: [ "uncommon", "new" ],
			patterns: {
				Tune: {
					loop: true,
					ls: 'X  X  X  X  X  X                ',
					ms: '@ls',
					hs: '                        X  X  X ',
					re: 'f   h X f   h   f   h X f   h   ',
					sn: 'X...X...X...X.....XXX...XXX.X...',
					ta: '    X       X       X       X   ',
					ag: '  aaa o aaa o     aaa           ',
					sh: '   XX      XX      XX      XX   '
				},
				"Bra Break": {
					ls: repeat(3, '        X       ') + 'X     X X  X  X ',
					ms: '@ls',
					hs: '@ls',
					re: repeat(3, 'f hr hr         ') + 'X     X X  X  X ',
					sn: repeat(3, '                ') + '..XXX...XXX.X...',
					ta: repeat(3, '           X  X ') + 'X     X X  X  X ',
					ag: '@ta',
					sh: '@ta'
				},
				"Kick Back 1": {
					re: '  XXX   XXX     ',
					ms: '            X   '
				},
				"Kick Back 2": {
					re: '  XXX   XXX     ',
					ms: '    X       X   '
				}
			}
		}
	};

	for(var i in bbDefaultTunes) {
		var tune = bbDefaultTunes[i];

		for(var j in tune.patterns) {
			var pattern = tune.patterns[j];

			pattern.time = pattern.time || tune.time || 4;
			pattern.length = 0;
			pattern.speed = pattern.speed || tune.speed;

			for(var k in bbConfig.instruments) {
				pattern[k] = pattern[k] || "";
				var m = pattern[k].match(/^@([a-z]{2})$/);
				if(m)
					pattern[k] = ng.copy(pattern[m[1]]);
				else {
					pattern[k] = pattern[k].split('');
					pattern.length = Math.max(pattern.length, pattern[k].length);
				}

				if(k == "ag")
					pattern[k] = pattern[k].map(function(it) { return it == "X" ? "o" : it; });
			}

			pattern.length = Math.ceil(pattern.length/pattern.time);

			tune.patterns[j] = new bbPattern(tune.patterns[j]);
		}

		bbDefaultTunes[i] = new bbTune(bbDefaultTunes[i]);
	}

	Object.defineProperty(bbDefaultTunes, "getPattern", {
		configurable: true,
		value: function(tuneName, patternName) {
			if(Array.isArray(tuneName)) {
				patternName = tuneName[1];
				tuneName = tuneName[0];
			}

			return this[tuneName] && this[tuneName].patterns[patternName];
		}
	});

	Object.defineProperty(bbDefaultTunes, "firstInSorting", {
		configurable: true,
		value: [ "General Breaks", "Special Breaks" ]
	});

	return bbDefaultTunes;
});