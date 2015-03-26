angular.module("ror-simulator").factory("Player", function($rootScope) {
	var sounds = { };
	for(var i in $rootScope.instruments) {
		for(var j=0; j<$rootScope.instruments[i].strokes.length; j++) {
			var k = i+"_"+$rootScope.instruments[i].strokes[j];
			sounds[k] = new Howl({
				urls: [ "assets/audio/"+k+".mp3" ]
			});
		}
	}

	var Player = {
		playSounds: function(instrument_strokes) {
			for(var i=0; i<instrument_strokes.length; i++) {
				if(sounds[instrument_strokes[i]])
					sounds[instrument_strokes[i]].play();
			}
		},
		playPattern: function(pattern, speed, callback) {
			var timeout;
			var timeoutFunc;
			var i = 0;
			async.forever(
				function(next) {
					var strokes = [ ];
					for(var instr in $rootScope.instruments) {
						if(pattern[instr][i] && pattern[instr][i] != " ")
							strokes.push(instr+"_"+pattern[instr][i]);
					}
					Player.playSounds(strokes);

					if(++i == pattern.length*pattern.measure) {
						if(callback)
							return callback();
						else
							i = 0;
					}

					timeout = setTimeout(next, 60000/speed/pattern.measure);
					timeoutFunc = next;
				}
			);

			return {
				playing : true,
				setSpeed : function(newSpeed) {
					speed = newSpeed;
				},
				stop : function() {
					if(this.playing) {
						clearTimeout(timeout);
						this.playing = false;
					}
				},
				start : function() {
					if(!this.playing) {
						this.playing = true;
						timeoutFunc();
					}
				}
			};
		}
	};

	return Player;
});