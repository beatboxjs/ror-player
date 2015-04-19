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

		testPlayer = $scope.player = bbPlayer.createBeatbox();

		$scope.playerOptions = {
			speed: 100,
			headphones: null,
			mute: { }
		};

		$scope.player.onbeat = function(i) {
			if(i%bbConfig.playTime != 0)
				return;
			i = i/bbConfig.playTime;

			// DOM manipulation in the controller? Where else could this go?
			var beat = $(".beat-i-"+i, $element);
			beat.addClass("active");
			setTimeout(function() { beat.removeClass("active"); }, 60000/$scope.playerOptions.speed);

			var beat = $(".beat-i-"+i, $element);
			var marker = $(".position-marker", $element).finish();

			marker.offset({ left: beat.offset().left });
			marker.animate({ left: (parseInt(marker.css("left"))+beat.outerWidth())+"px" }, 60000/$scope.playerOptions.speed, "linear");
		};

		function updatePattern() {
			$scope.player.setPattern(bbPlayer.songToBeatbox($scope.song, $scope.playerOptions.headphones, $scope.playerOptions.mute));
		}

		$scope.$watch("song", updatePattern, true);
		$scope.$watch("playerOptions.speed", function(newSpeed) {
			$scope.player.setBeatLength(60000/newSpeed/bbConfig.playTime);
		});

		$scope.playPause = function() {
			if(!$scope.player.playing)
				$scope.player.play();
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
			$scope.song = { };
		};

		$scope.getLength = function() {
			return bbUtils.getSongLength($scope.song)+1;
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

		$scope.getBeatClass = function(i) {
			var ret = [ "beat-"+(i%4), "beat-i-"+i ];
			if(i%4 == 3)
				ret.push("before-bar");
			if(i%4 == 0)
				ret.push("after-bar");
			return ret;
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

		$scope.equals = ng.equals;

		$scope.onDrag = function(instrumentKey, idx) {
			$scope.removePattern(instrumentKey, idx);
		};

		$scope.onDrop = function(instrumentKey, idx, data) {
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

		$scope.dragStart = function() {
			$scope.dragging = true;
		};

		$scope.dragStop = function() {
			$scope.dragging = false;
		}

		$scope.onOver = function() {
			console.log("over");
		}
	});