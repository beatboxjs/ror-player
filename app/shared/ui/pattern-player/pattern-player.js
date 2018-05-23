import app from "../../../app";
import "./pattern-player.scss";

app.directive("bbPatternPlayer", function($, $templateCache) {
	$templateCache.put("app/shared/ui/pattern-player/pattern-player-stroke-dropdown.html", require("./pattern-player-stroke-dropdown.html"));

	return {
		template: require("./pattern-player.html"),
		scope: {
			pattern: "=bbPattern",
			originalPattern: "=bbPatternOriginal",
			editable: "=bbPatternEditable"
		},
		controller: "bbPatternController",
		transclude: true
	};
});

app.controller("bbPatternController", function($scope, $element, bbPlayer, bbConfig, bbUtils, ng, $) {
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

		var beat = $(".beat-i-" + Math.floor(i / bbConfig.playTime), $element);
		$(".beat.active").not(beat).removeClass("active");
		beat.addClass("active");
	}

	$scope.player = bbPlayer.createBeatbox(true);
	$scope.player.onbeat = strokeCallback;

	$scope.playerOptions = {
		speed: $scope.pattern.speed,
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

	$scope.allMuted = function() {
		for(var instrumentKey in bbConfig.instruments) {
			if(!$scope.playerOptions.mute[instrumentKey])
				return false;
		}
		return true;
	};

	$scope.muteAll = function() {
		var mute = !$scope.allMuted();
		for(var instrumentKey in bbConfig.instruments) {
			$scope.playerOptions.mute[instrumentKey] = mute;
		}
		updatePattern();
	};

	$scope.setPosition = function(i, $event) {
		var beat = $($event.target).closest(".beat");
		var add = ($event.pageX - beat.offset().left) / beat.outerWidth();
		$scope.player.setPosition(Math.floor((i+add)*bbConfig.playTime));
		updateMarkerPosition(false);
	};

	$scope.hasLocalChanges = function() {
		return $scope.originalPattern && !$scope.pattern.equals($scope.originalPattern);
	};

	$scope.reset = function() {
		bbUtils.confirm("Are you sure that you want to revert your modifications and restore the original break?").then(function() {
			ng.copy($scope.originalPattern, $scope.pattern);
		});
	};

	$scope.clickStroke = function(instrumentKey, i) {
		if(ng.equals($scope.currentStrokeDropdown, [ instrumentKey, i ]))
			$scope.currentStrokeDropdown = null;
		else
			$scope.currentStrokeDropdown = [ instrumentKey, i ];
	};

	var clickHandler = function(e) {
		var el = $(e.target);
		if(el.closest(".stroke-inner").length == 0 && $scope.currentStrokeDropdown != null ) {
			$scope.$apply(function() {
				$scope.currentStrokeDropdown = null;
			});
		}
	};

	$(document).click(clickHandler);

	$scope.$on("$destroy", function() {
		$(document).off("click", clickHandler);
	});
});