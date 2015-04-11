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
			// DOM manipulation in the controller? Where else could this go?
			if(i%$scope.pattern.time == 0) {
				var beat = $(".beat-i-"+(i/$scope.pattern.time), $element);
				beat.addClass("active");
				setTimeout(function() { beat.removeClass("active"); }, 12000/$scope.playingOptions.speed);
			}

			var stroke = $(".stroke-i-"+i, $element);
			var marker = $(".position-marker", $element).finish();

			marker.offset({ left: stroke.offset().left });
			marker.animate({ left: (parseInt(marker.css("left"))+stroke.outerWidth())+"px" }, 60000/$scope.playingOptions.speed/$scope.pattern.time, "linear");
		}

		$scope.playingOptions = {
			speed: 100,
			headphones: null,
			muted: { },
			strokeCallback: strokeCallback
		};

		$scope.playing = null;

		$scope.playPause = function() {
			if(!$scope.playing)
				$scope.playing = bbPlayer.playPattern($scope.pattern, $scope.playingOptions);
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
			if($scope.playingOptions.headphones == instrumentKey)
				$scope.playingOptions.headphones = null;
			else
				$scope.playingOptions.headphones = instrumentKey;
		};

		$scope.mute = function(instrumentKey) {
			$scope.playingOptions.mute[instrumentKey] = !$scope.playingOptions.mute[instrumentKey];
		};
	});