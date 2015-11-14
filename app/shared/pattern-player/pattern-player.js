angular.module("beatbox")
	.directive("bbPatternPlayer", function($) {
		return {
			templateUrl: "app/shared/pattern-player/pattern-player.html",
			scope: {
				pattern: "=bbPattern",
				originalPattern: "=bbPatternOriginal",
				editable: "=bbPatternEditable"
			},
			controller: "bbPatternController"
		};
	})
	.controller("bbPatternController", function($scope, $element, bbPlayer, bbConfig, bbUtils, ng, $ngBootbox) {
		$scope.config = bbConfig;
		$scope.utils = bbUtils;

		function handleIdx(i) {
			var i = $scope.player.getPosition();
			var fac = bbConfig.playTime / $scope.pattern.time;
			if(i % fac != 0)
				return null;
			return i/fac;
		}

		function updateMarkerPosition(scrollFurther, force) {
			var i = $scope.player.getPosition() * $scope.pattern.time / bbConfig.playTime;
			var strokeIdx = Math.floor(i);

			var stroke = $(".stroke-i-"+strokeIdx, $element);
			var marker = $(".position-marker", $element);
			if(stroke.length > 0) {
				marker.offset({ left: stroke.offset().left + stroke.outerWidth() * (i - strokeIdx) });
				bbUtils.scrollToElement(marker, scrollFurther, force);
			}
		}

		function strokeCallback(i) {
			updateMarkerPosition(true);
			
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
			if(!$scope.player.playing) {
				$scope.player.play();
				updateMarkerPosition(true, true);
			}
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

		$scope.setPosition = function(i, $event) {
			var beat = $($event.target).closest(".beat");
			var add = ($event.pageX - beat.offset().left) / beat.outerWidth();
			$scope.player.setPosition(Math.floor((i+add)*bbConfig.playTime));
			updateMarkerPosition(false);
		};

		$scope.hasLocalChanges = function() {
			return $scope.originalPattern && !angular.equals($scope.pattern, $scope.originalPattern);
		};

		$scope.reset = function() {
			$ngBootbox.confirm("Are you sure that you want to revert your modifications and restore the original break?").then(function() {
				ng.copy($scope.originalPattern, $scope.pattern);
			});
		};
	});