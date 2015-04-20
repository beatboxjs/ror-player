angular.module("beatbox").factory("bbConfig", function(ng, $rootScope) {
	var bbConfig = { };

	bbConfig.instruments = {
		ls: {
			name: "Low Surdo",
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		ms: {
			name: "Mid Surdo",
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		hs: {
			name: "High Surdo",
			strokes: [ "X", "0", "s", "t", "r" ]
		},
		re: {
			name: "Repi",
			strokes: [ "X", "f", "r", "h", "s", "." ]
		},
		sn: {
			name: "Snare",
			strokes: [ ".", "X", "r" ]
		},
		ta: {
			name: "Tamborim",
			strokes: [ "X", "r" ]
		},
		ag: {
			name: "Agogo",
			strokes: [ "o", "a", "r" ]
		},
		sh: {
			name: "Shaker",
			strokes: [ "X" ]
		},
		ot: {
			name: "Others",
			strokes: [ "w", "y", "A", "B", "C", "D", "E", "F", "G", "T", "U", "V", "W", "Y", "Z" ]
		}
	};

	bbConfig.strokes = {
		"X": "X",
		"h": "hd",
		"0": "0",
		"s": "sil",
		"f": "fl",
		"r": "rim",
		"o": "l",
		"a": "h",
		"t": "w", // Whippy stick (tamborim stick)
		".": ".",
		"w" : "Wh",
		"y" : "Wh2", // Long whistle
		"A" : "Oi!",
		"B" : "Ua!",
		"C" : "Aoo!",
		"D" : "Oo",
		"E" : "Ah",
		"F" : "Hey!",
		"G" : "Ook!",
		"T" : "E",
		"U" : "very",
		"V" : "bo",
		"W" : "dy",
		"Y" : "dance",
		"Z" : "now"
	};

	bbConfig.times = [ 2, 3, 4, 12 ];

	// Time measurement that is used for beatbox.js. Should be able to represent all the time measurements above
	bbConfig.playTime = 12;

	bbConfig.tunes = {
		'General Breaks': {
			patterns: {
				"Kalashnikov": {
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
					volumeHack: (function(){ var r={}; for(var i=0; i<32; i++) r[i] = .07+.03*i; return r; })()
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
				}
			}
		},
		"Afoxe": {
			patterns: {
				"Tune": {
					ls: 's   s   s   s   s   s   X   X   ',
					ms: '0     X 0     X 0     X X X X X ',
					hs: '@ms',
					re: 'f  hs r f  hs r f  hs r s r s r ',
					sn: 'X...X..XX..X....X...X..XX..X....',
					ta: 'X X X X XX XX X X X X X XX XX X ',
					ag: 'a a o o aa o oo a a o o aa o oo '
				},
				"Break 1": {
					ls: 'X       X       X       X XXXXX ',
					ms: '@ls',
					hs: '@ls',
					re: '   XXXX    XXXX    XXXX X XXXXX ',
					sn: '@re',
					ta: '@re',
					ag: '@re'
				},
				"Break 2": {
					ls: 's   s   s   s   s   s   X   X   ',
					ms: '      X       X       X   XXXXX ',
					hs: '@ms',
					re: 'f  hs r f  hs r f  hs r s r s r ',
					sn: 'X...X..XX..X....X...X..XX..X....',
					ta: 'X X X X XX XX X X X X X XX XX X ',
					ag: 'a a o o aa o oo a a o o aa o oo '
				},
				"Break 3": {
					ls: 's   s   s   s   s   s   X   X   ',
					ms: '   XXXX    XXXX    XXXX X XXXXX ',
					hs: '@ms',
					re: 'f  hs r f  hs r f  hs r s r s r ',
					sn: 'X...X..XX..X....X...X..XX..X....',
					ta: 'X X X X XX XX X X X X X XX XX X ',
					ag: 'a a o o aa o oo a a o o aa o oo '
				},
				"Bra Break": {
					ls: '        XX XX           XX XX           XX XX   X X X X XX XX X ',
					ms: '@ls',
					hs: '@ls',
					re: 'X X X           X X X           X X X           X X X X XX XX X ',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls'
				},
				"Tamborim Stroke": {
					ls: 'X X X X XX XX X ',
					ms: '@ls',
					hs: '@ls',
					re: '@ls',
					sn: '@ls',
					ta: '@ls',
					ag: '@ls'
				},
				"Wulf Break": {
					ls: 'X X   XXX X    XX X    XX X     X X   XXX X    XX X X X X       ',
					ms: '@ls',
					hs: '@ls',
					re: '    X       X       X       X       X       X  XX X X X X       ',
					sn: '@re',
					ta: '@re',
					ag: '@re',
					ot: '                                                          C     '
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
				},
				"Bra Break": {
					ls: '                                                                        X XX XX XX              ',
					ms: '@ls',
					hs: '@ls',
					re: 'XXXXXXXXXX              XXXXXXXXXX              XXXX        XXXXXXXXXX              XXXXXXX     ',
					sn: '            XXXXXXXXXX              XXXXXXXXXX        XXXX                          XXXXXXX     ',
					ta: '@re',
					ag: '@re',
					ot: '                                                                                             F  '
				},
				"Kalashnikov (3⁄4)": {
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
					volumeHack: (function(){ var r={}; for(var i=0; i<24; i++) r[i] = .011+.043*i; return r; })()
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
				},
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
		'Orangutan': {
			patterns: {
				Tune: {
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
		'Sambasso': {
			patterns: {
				Tune: {
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
		}
	};

	for(var i in bbConfig.tunes) {
		var tune = bbConfig.tunes[i];

		for(var j in tune.patterns) {
			var pattern = tune.patterns[j];

			pattern.time = pattern.time || tune.time || 4;
			pattern.length = 0;

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
		}
	}

	bbConfig.myTunesKey = "My tunes";
	bbConfig.tunes[bbConfig.myTunesKey] = localStorage.myTunes ? JSON.parse(localStorage.myTunes) : { patterns: { } };

	bbConfig.myTunes = bbConfig.tunes[bbConfig.myTunesKey];
	$rootScope.$watch(function(){ return bbConfig.myTunes; }, function(myTunes) {
		localStorage.myTunes = JSON.stringify(myTunes);
	}, true);

	return bbConfig;
});