angular.module("beatbox")
	.directive("bbSongPlayer", function() {
		return {
			templateUrl: "app/shared/song-player/song-player.html",
			controller: "bbSongPlayerController",
			scope: {
				song: '=bbSong'
			}
		};
	})
	.controller("bbSongPlayerController", function($scope, bbConfig, $modal, ng, bbUtils, bbPlayer, $element, $timeout) {
		$scope.config = bbConfig;
		$scope.utils = bbUtils;

		$scope.player = bbPlayer.createBeatbox();

		$scope.playerOptions = {
			speed: 100,
			headphones: null,
			mute: { },
			loop: false
		};

		function updateMarkerPos(scrollFurther, force) {
			var i = $scope.player.getPosition()/bbConfig.playTime;
			var beatIdx = Math.floor(i);

			var beat = $(".beat-i-"+beatIdx, $element);
			$(".beat.active").not(beat).removeClass("active");
			beat.addClass("active");

			if(beat.length > 0)
				bbUtils.scrollToElement($(".song-position-marker", $element).offset({ left: beat.offset().left + (i-beatIdx) * beat.outerWidth() }), scrollFurther, force);
		}

		$scope.player.onbeat = function(idx) { updateMarkerPos(true); };

		function updatePattern() {
			$scope.player.setPattern(bbPlayer.songToBeatbox($scope.song, $scope.playerOptions.headphones, $scope.playerOptions.mute));
		}

		$scope.$watch("song", updatePattern, true);
		$scope.$watch("playerOptions.speed", function(newSpeed) {
			$scope.player.setBeatLength(60000/newSpeed/bbConfig.playTime);
		});
		$scope.$watch("playerOptions.loop", function(loop) {
			$scope.player.setRepeat(loop);
		});

		$scope.playPause = function() {
			if(!$scope.player.playing) {
				$scope.player.play();
				updateMarkerPos(true, true);
			}
			else
				$scope.player.stop();
		};

		$scope.stop = function() {
			if($scope.player.playing)
				$scope.player.stop();
			$scope.player.setPosition(0);
		};

		$scope.headphones = function(instrumentKey) {
			if($scope.playerOptions.headphones == instrumentKey)
				$scope.playerOptions.headphones = null;
			else
				$scope.playerOptions.headphones = instrumentKey;
			updatePattern();
		};

		$scope.mute = function(instrumentKey) {
			$scope.playerOptions.mute[instrumentKey] = !$scope.playerOptions.mute[instrumentKey];
			updatePattern();
		};

		$scope.clear = function() {
			if(confirm("Do you really want to remove your current song?")) {
				$scope.song = { };
			}
		};

		$scope.getLength = function() {
			var length = bbUtils.getSongLength($scope.song)+1;
			if($scope.currentPatternDrag)
				length = Math.max(length, $scope.currentPatternDrag.toIdx+2);
			return length;
		};

		$scope.getColSpan = function(instrumentKey, i) {
			var pattern = ($scope.song[i] && $scope.song[i][instrumentKey]);
			if(!pattern)
				return 1;

			pattern = bbUtils.getPattern(pattern);
			if(!pattern)
				return 1;

			var ret = 1;
			while(ret<(pattern.length/4)) {
				if($scope.song[i+ret] && $scope.song[i+ret][instrumentKey])
					break;

				ret++;
			}
			return ret;
		};

		$scope.getRowSpan = function(instrumentKey, i) {
			if(!$scope.song[i] || !$scope.song[i][instrumentKey])
				return 1;

			var instrumentKeys = Object.keys(bbConfig.instruments);
			var idx = instrumentKeys.indexOf(instrumentKey);
			var colspan = $scope.getColSpan(instrumentKey, i);
			var ret = 1;
			for(var j=idx+1; j<instrumentKeys.length; j++) {
				if(ng.equals($scope.song[i][instrumentKey], $scope.song[i][instrumentKeys[j]]) && colspan == $scope.getColSpan(instrumentKeys[j], i))
					ret++;
				else
					break;
			}
			return ret;
		};

		$scope.shouldDisplay = function(instrumentKey, i) {
			var instrumentKeys = Object.keys(bbConfig.instruments);
			var idx = instrumentKeys.indexOf(instrumentKey);
			if (idx > 0 && $scope.getRowSpan(instrumentKeys[idx-1], i) >= 2)
				return false;

			for(var j=i-1; j>=0; j--) {
				if($scope.song[j] && $scope.song[j][instrumentKey])
					return (j + $scope.getColSpan(instrumentKey, j) - 1 < i);
			}

			return true;
		};

		$scope.removePattern = function(instrumentKey, idx) {
			var instrumentKeys = Object.keys(bbConfig.instruments);
			var span = $scope.getRowSpan(instrumentKey, idx);
			var instrIdx = instrumentKeys.indexOf(instrumentKey);
			for(var i=0; i<span; i++) {
				delete $scope.song[idx][instrumentKeys[instrIdx+i]];
			}
			if(Object.keys($scope.song[idx]).length == 0)
				delete $scope.song[idx];
		};

		$scope.toggleInstrument = function(instrumentKey, idx, tuneAndPattern) {
			if(ng.equals($scope.song[idx][instrumentKey], tuneAndPattern))
				delete $scope.song[idx][instrumentKey];
			else
				$scope.song[idx][instrumentKey] = tuneAndPattern;
		};

		$scope.getPreviewPlayerOptions = function(instrumentKey, idx) {
			var ret = {
				mute: { },
				speed: $scope.playerOptions.speed,
				length: $scope.getColSpan(instrumentKey, idx)*4
			};

			var instrumentKeys = Object.keys(bbConfig.instruments);
			var instrumentIdx = instrumentKeys.indexOf(instrumentKey);
			var rowSpan = $scope.getRowSpan(instrumentKey, idx);
			for(var i=0; i<instrumentKeys.length; i++) {
				ret.mute[instrumentKeys[i]] = (i < instrumentIdx || i >= instrumentIdx+rowSpan);
			}

			return ret;
		};

		$scope.setPosition = function(idx, $event) {
			var beat = $($event.target).closest(".beat");
			var add = ($event.pageX - beat.offset().left) / beat.outerWidth();
			$scope.player.setPosition(Math.floor((idx+add)*bbConfig.playTime));
			updateMarkerPos(false);
		};

		$scope.equals = ng.equals;

		$scope.onDrag = function(instrumentKey, idx) {
			$scope.removePattern(instrumentKey, idx);
		};

		$scope.onDrop = function(instrumentKey, idx, data) {
			if(data.bbDragType == "pattern-placeholder")
				$scope.dropPattern(instrumentKey, idx, data);
			else if(data.bbDragType == "resize-pattern")
				$scope.resizePattern(data[0], data[1], instrumentKey, idx);
		};

		$scope.dropPattern = function(instrumentKey, idx, data) {
			if(!$scope.song[idx])
				$scope.song[idx] = { };

			if(instrumentKey)
				$scope.song[idx][instrumentKey] = data;
			else {
				for(var i in bbConfig.instruments) {
					$scope.song[idx][i] = data;
				}
			}
		};

		$scope.resizePattern = function(instrumentKey, idx, toInstrumentKey, toIdx) {
			var tuneAndPattern = $scope.song[idx][instrumentKey];
			$scope.removePattern(instrumentKey, idx);

			var patternLength = Math.ceil(bbUtils.getPattern(tuneAndPattern[0], tuneAndPattern[1]).length/4);
			getAffectedResizePatternRange(instrumentKey, idx, toInstrumentKey, toIdx, patternLength).forEach(function(it) {
				$scope.dropPattern(it[0], it[1], tuneAndPattern);
			});
		};

		function getAffectedResizePatternRange(instrumentKey, idx, toInstrumentKey, toIdx, patternLength) {
			var instrumentKeys = Object.keys(bbConfig.instruments);
			var instrumentIdx = instrumentKeys.indexOf(instrumentKey);
			var toInstrumentIdx = instrumentKeys.indexOf(toInstrumentKey);
			toIdx = Math.max(idx, toIdx);

			var ret = [ ];

			for(var i=idx; i<=toIdx; i += (patternLength || 1)) {
				for(var j=Math.min(instrumentIdx, toInstrumentIdx); j<=Math.max(instrumentIdx, toInstrumentIdx); j++) {
					ret.push([ instrumentKeys[j], i ]);
				}
			}

			return ret;
		}

		$scope.currentPatternDrag = null;

		$scope.dragStart = function(data) {
			if(data.bbDragType == "pattern-placeholder")
				$scope.dragging = true;
		};

		$scope.dragStop = function() {
			$scope.dragging = false;
			$scope.currentPatternDrag = null;
			updateDragStyles();
		};

		$scope.dragEnter = function(instrumentKey, i, data) {
			if(data.bbDragType == "resize-pattern") {
				$scope.currentPatternDrag = { instrumentKey: data[0], idx: data[1], toInstrumentKey: instrumentKey, toIdx: i };
				updateDragStyles();
			}
		};

		function updateDragStyles() {
			$(".pattern-resize-range", $element).removeClass("pattern-resize-range");

			var c = $scope.currentPatternDrag;
			if(c) {
				getAffectedResizePatternRange(c.instrumentKey, c.idx, c.toInstrumentKey, c.toIdx).forEach(function(it) {
					$(".song-field-"+it[0]+"-"+it[1], $element).addClass("pattern-resize-range");
				});
			}
		}

		$scope.getResizeDragData = function(instrumentKey, i) {
			var ret = [ instrumentKey, i ];
			ret.bbDragType = "resize-pattern";
			return ret;
		};

		$scope.downloadMP3 = function() {
			$scope.loading = 0;
			$scope.player.exportMP3(function(blob) {
				$scope.$apply(function() {
					$scope.loading = null;
				});
				saveAs(blob, "song.mp3");
			}, function(perc) {
				$scope.$apply(function() {
					$scope.loading = perc*100;
				});
			});
		};

		$scope.downloadWAV = function() {
			$scope.loading = 0;
			$scope.player.exportWAV(function(blob) {
				$scope.$apply(function() {
					$scope.loading = null;
				});
				saveAs(blob, "song.wav");
			}, function(perc) {
				$scope.$apply(function() {
					$scope.loading = perc*100;
				});
			});
		};
	});