angular.module("ror-simulator")
	.directive("rorSongPlayer", function() {
		return {
			templateUrl: "app/shared/song-player/song-player.html",
			controller: "RorSongPlayerController",
			scope: {
				song: '=rorSong'
			}
		};
	})
	.controller("RorSongPlayerController", function($scope, RorConstants, $modal, ng, RorUtils, Player, $element, $timeout) {
		$scope.ror = RorConstants;
		$scope.utils = RorUtils;

		$scope.playingOptions = {
			speed: 100,
			headphones: null,
			muted: { },
			beatCallback: beatCallback
		};

		function beatCallback(i) {
			// DOM manipulation in the controller? Where else could this go?
			var beat = $(".beat-i-"+i, $element);
			beat.addClass("active");
			setTimeout(function() { beat.removeClass("active"); }, 60000/$scope.playingOptions.speed);

			var beat = $(".beat-i-"+i, $element);
			var marker = $(".position-marker", $element).finish();

			marker.offset({ left: beat.offset().left });
			marker.animate({ left: (parseInt(marker.css("left"))+beat.outerWidth())+"px" }, 60000/$scope.playingOptions.speed, "linear");
		}

		$scope.playing = null;

		$scope.playPause = function() {
			if(!$scope.playing) {
				$scope.playing = Player.playSong($scope.song, $scope.playingOptions, function() {
					$timeout(function() {
						$scope.playing = null;
					});
				});
			}
			else if($scope.playing.playing)
				$scope.playing.stop();
			else
				$scope.playing.start();
		};

		$scope.stop = function() {
			if($scope.playing) {
				$scope.playing.stop();
				$scope.playing = null;
			}
		};

		$scope.headphones = function(instrumentKey) {
			if($scope.playingOptions.headphones == instrumentKey)
				$scope.playingOptions.headphones = null;
			else
				$scope.playingOptions.headphones = instrumentKey;
		};

		$scope.mute = function(instrumentKey) {
			$scope.playingOptions.mute[instrumentKey] = !$scope.playingOptions.mute[instrumentKey];
		};

		$scope.clear = function() {
			$scope.song = { };
		};

		$scope.getLength = function() {
			return RorUtils.getSongLength($scope.song)+1;
		};

		$scope.getColSpan = function(instrumentKey, i) {
			var pattern = ($scope.song[i] && $scope.song[i][instrumentKey]);
			if(!pattern)
				return 1;

			pattern = RorUtils.getPattern(pattern);
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

			var idx = RorConstants.instrumentKeys.indexOf(instrumentKey);
			var colspan = $scope.getColSpan(instrumentKey, i);
			var ret = 1;
			for(var j=idx+1; j<RorConstants.instrumentKeys.length; j++) {
				if(ng.equals($scope.song[i][instrumentKey], $scope.song[i][RorConstants.instrumentKeys[j]]) && colspan == $scope.getColSpan(RorConstants.instrumentKeys[j], i))
					ret++;
				else
					break;
			}
			return ret;
		};

		$scope.shouldDisplay = function(instrumentKey, i) {
			var idx = RorConstants.instrumentKeys.indexOf(instrumentKey);
			if (idx > 0 && $scope.getRowSpan(RorConstants.instrumentKeys[idx-1], i) >= 2)
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
			var span = $scope.getRowSpan(instrumentKey, idx);
			var instrIdx = RorConstants.instrumentKeys.indexOf(instrumentKey);
			for(var i=0; i<span; i++) {
				delete $scope.song[idx][RorConstants.instrumentKeys[instrIdx+i]];
			}
			if(Object.keys($scope.song[idx]).length == 0)
				delete $scope.song[idx];
		};

		$scope.onDrag = function(instrumentKey, idx) {
			$scope.removePattern(instrumentKey, idx);
		};

		$scope.onDrop = function(instrumentKey, idx, data) {
			if(!$scope.song[idx])
				$scope.song[idx] = { };

			if(instrumentKey)
				$scope.song[idx][instrumentKey] = data;
			else {
				for(var i in RorConstants.instruments) {
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