angular.module("beatbox")
	.directive("bbPatternPlayer", function($) {
		return {
			templateUrl: "app/shared/pattern-player/pattern-player.html",
			scope: {
				pattern: "=bbPattern",
				editable: "=bbPatternEditable"
			},
			controller: "bbPatternController"
		};
	})
	.controller("bbPatternController", function($scope, $element, bbPlayer, bbConfig, bbUtils) {
		$scope.config = bbConfig;
		$scope.utils = bbUtils;

		function strokeCallback(i) {
			var fac = bbConfig.playTime / $scope.pattern.time;
			if(i % fac != 0)
				return;
			i = i/fac;

			// DOM manipulation in the controller? Where else could this go?
			if(i%$scope.pattern.time == 0) {
				var beat = $(".beat-i-"+(i/$scope.pattern.time), $element);
				beat.addClass("active");
				setTimeout(function() { beat.removeClass("active"); }, 12000/$scope.playerOptions.speed);
			}

			var stroke = $(".stroke-i-"+i, $element);
			var marker = $(".position-marker", $element).finish();

			if(stroke.length > 0) {
				marker.offset({ left: stroke.offset().left });
				marker.animate({ left: (parseInt(marker.css("left"))+stroke.outerWidth())+"px" }, 60000/$scope.playerOptions.speed/$scope.pattern.time, "linear");
			}
		}

		$scope.player = bbPlayer.createBeatbox(true);
		$scope.player.onbeat = strokeCallback;

		$scope.playerOptions = {
			speed: 100,
			headphones: null,
			mute: { }
		};

		function updatePattern() {
			$scope.player.setPattern(bbPlayer.patternToBeatbox($scope.pattern, $scope.playerOptions.headphones, $scope.playerOptions.mute));
		}

		$scope.$watch("pattern", updatePattern, true);
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

		$scope.getBeatClass = function(i) {
			var ret = [ "beat-"+(i%4), "beat-i-"+i ];
			if(i%4 == 3)
				ret.push("before-bar");
			if(i%4 == 0)
				ret.push("after-bar");
			return ret;
		};

		$scope.getStrokeClass = function(i) {
			var ret = [
				"stroke-"+(i%$scope.pattern.time),
				"stroke-i-"+i
			];
			if((i+1)%$scope.pattern.time == 0)
				ret.push("before-beat");
			if(i%$scope.pattern.time == 0)
				ret.push("after-beat");
			if((i+1)%($scope.pattern.time*4) == 0)
				ret.push("before-bar");
			if(i%($scope.pattern.time*4) == 0)
				ret.push("after-bar");
			return ret;
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
	});