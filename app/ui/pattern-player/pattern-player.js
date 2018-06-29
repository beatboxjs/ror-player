import app from "../../app";
import "./pattern-player.scss";

app.directive("bbPatternPlayer", function($, $templateCache) {
	$templateCache.put("app/shared/ui/pattern-player/pattern-player-stroke-dropdown.html", require("./pattern-player-stroke-dropdown.html"));

	return {
		template: require("./pattern-player.html"),
		scope: {
			pattern: "=bbPattern",
			originalPattern: "=bbPatternOriginal",
			readonly: "<bbReadonly",
			presetPlaybackSettings: "=bbSettings",
			player: "=?bbPlayer"
		},
		controller: "bbPatternController",
		transclude: true
	};
});

app.controller("bbPatternController", function($scope, $element, bbPlayer, bbConfig, bbUtils, ng, $, bbPlaybackSettings) {
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
		var i = ($scope.player.getPosition() * $scope.pattern.time / bbConfig.playTime) - $scope.pattern.upbeat;
		var strokeIdx = Math.floor(i);

		var stroke = $(".stroke-i-"+strokeIdx, $element);
		var marker = $(".position-marker", $element);
		if(stroke.length > 0) {
			marker.offset({ left: stroke.offset().left + stroke.outerWidth() * (i - strokeIdx) });
			bbUtils.scrollToElement(marker, scrollFurther, force);
		}
	}

	function strokeCallback(beatIdx) {
		updateMarkerPosition(true);

		let i = Math.floor(beatIdx / bbConfig.playTime - $scope.pattern.upbeat / $scope.pattern.time);
		var beat = $(".beat-i-" + i, $element);
		$(".beat.active").not(beat).removeClass("active");
		beat.addClass("active");
	}

	if(!$scope.player)
		$scope.player = bbPlayer.createBeatbox(true);

	$scope.player.onbeat = strokeCallback;

	$scope.playbackSettings = Object.assign(new bbPlaybackSettings($scope.presetPlaybackSettings), {
		speed: $scope.pattern.speed,
		loop: $scope.pattern.loop
	});
	$scope.$watch("playbackSettings", () => {
		$scope.presetPlaybackSettings.volume = $scope.playbackSettings.volume;
		$scope.presetPlaybackSettings.volumes = $scope.playbackSettings.volumes;
	}, true);
	$scope.$watch("presetPlaybackSettings", () => {
		$scope.playbackSettings.volume = $scope.presetPlaybackSettings.volume;
		$scope.playbackSettings.volumes = $scope.presetPlaybackSettings.volumes;
	}, true);


	function updatePlayer() {
		$scope.player.setPattern(bbPlayer.patternToBeatbox($scope.pattern, $scope.playbackSettings));
		$scope.player.setBeatLength(60000/$scope.playbackSettings.speed/bbConfig.playTime);
		$scope.player.setRepeat($scope.playbackSettings.loop);
	}

	$scope.$watch("pattern", updatePlayer, true);
	$scope.$watch("playbackSettings", updatePlayer, true);

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

	$scope.getStrokeClass = function(realI, instrumentKey) {
		let i = realI - $scope.pattern.upbeat;

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

		if($scope.originalPattern && ($scope.originalPattern[instrumentKey][realI] || "").trim() != ($scope.pattern[instrumentKey][realI] || "").trim())
			ret.push("has-changes");

		return ret;
	};

	$scope.headphones = function(...instrumentKeys) {
		for(let instrumentKey of instrumentKeys) {
			let idx = $scope.playbackSettings.headphones.indexOf(instrumentKey);
			if(idx == -1)
				$scope.playbackSettings.headphones.push(instrumentKey);
			else
				$scope.playbackSettings.headphones.splice(idx, 1);
		}
	};

	$scope.headphoneAll = function() {
		if($scope.playbackSettings.headphones.length == 0)
			$scope.playbackSettings.headphones = Object.keys(bbConfig.instruments);
		else
			$scope.playbackSettings.headphones = [ ];
	};

	$scope.isHiddenSurdoHeadphone = function(instrumentKey) {
		let surdos = ["ls", "ms", "hs"];
		return surdos.includes(instrumentKey) && !surdos.some((it) => ($scope.playbackSettings.headphones.includes(it)));
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
			$scope.currentStrokeDropdown = { instr: instrumentKey, i };
	};

	var clickHandler = function(e) {
		var el = $(e.target);
		if(el.closest(".stroke-inner").length == 0 && $scope.currentStrokeDropdown != null ) {
			$scope.$apply(function() {
				$scope.currentStrokeDropdown = null;
			});
		}
	};

	$scope.getCurrentStrokeSequenceOptions = function() {
		let possibleStrokes = [];

		if(!$scope.currentStrokeDropdown.sequence)
			return possibleStrokes;

		for(let strokeKey of bbConfig.instruments[$scope.currentStrokeDropdown.instr].strokes) {
			let strokeDesc = bbConfig.strokes[strokeKey];

			if(strokeDesc.toLowerCase().startsWith($scope.currentStrokeDropdown.sequence))
				possibleStrokes.push(strokeKey);
		}
		return possibleStrokes;
	};

	var switchToNext = function(previous) {
		if(!$scope.currentStrokeDropdown || previous && $scope.currentStrokeDropdown.i == 0 || !previous && $scope.currentStrokeDropdown.i >= $scope.pattern.length*$scope.pattern.time)
			return $scope.currentStrokeDropdown = null;

		$scope.currentStrokeDropdown = {
			instr: $scope.currentStrokeDropdown.instr,
			i: $scope.currentStrokeDropdown.i + (previous ? -1 : 1)
		};
		$scope.$apply();
	};

	var keyDownHandler = function(e) {
		if(!$scope.currentStrokeDropdown || e.ctrlKey || e.altKey || e.metaKey)
			return;

		if(e.which == 37 | e.which == 39) { // Left/right arrow
			$scope.currentStrokeDropdown.sequence = null;

			let strokes = bbConfig.instruments[$scope.currentStrokeDropdown.instr].strokes;
			let curIdx = strokes.indexOf($scope.pattern[$scope.currentStrokeDropdown.instr][$scope.currentStrokeDropdown.i]);

			if(e.which == 39 && curIdx+1 < strokes.length)
				$scope.pattern[$scope.currentStrokeDropdown.instr][$scope.currentStrokeDropdown.i] = strokes[curIdx+1];
			else if(e.which == 37 && curIdx-1 >= 0)
				$scope.pattern[$scope.currentStrokeDropdown.instr][$scope.currentStrokeDropdown.i] = strokes[curIdx-1];
			else if(e.which == 37)
				$scope.pattern[$scope.currentStrokeDropdown.instr][$scope.currentStrokeDropdown.i] = " ";

			$scope.$apply();
			e.preventDefault();
		} else if(e.which == 13) { // Enter/return
			let possibleStrokes = $scope.getCurrentStrokeSequenceOptions();
			if(possibleStrokes.length > 0)
				$scope.pattern[$scope.currentStrokeDropdown.instr][$scope.currentStrokeDropdown.i] = possibleStrokes[0];

			switchToNext();
			e.preventDefault();
		} else if(e.which == 9) { // Tab
			switchToNext(e.shiftKey);
			e.preventDefault();
		} else if(e.which == 27) { // Escape
			$scope.currentStrokeDropdown = null;
			e.preventDefault();
		} else if(e.which == 32) { // Space
			$scope.pattern[$scope.currentStrokeDropdown.instr][$scope.currentStrokeDropdown.i] = ' ';
			switchToNext();
			e.preventDefault();
		}
	};

	var keySequenceTimeout = null;

	var keyPressHandler = function(e) {
		let d = $scope.currentStrokeDropdown;
		if(!d || e.ctrlKey || e.altKey || e.metaKey)
			return;

		clearTimeout(keySequenceTimeout);
		keySequenceTimeout = setTimeout(() => { d.sequence = null; $scope.$apply(); }, 1000);

		d.sequence = (d.sequence || "") + String.fromCharCode(e.which).toLowerCase();

		if(d.sequence.length == 1) {
			let options = $scope.getCurrentStrokeSequenceOptions();
			if(options.length == 1) {
				$scope.pattern[$scope.currentStrokeDropdown.instr][$scope.currentStrokeDropdown.i] = options[0];
				switchToNext();
				return false;
			}
		}

		$scope.$apply();
		return false;
	};

	$(document).on({
		click: clickHandler,
		keydown: keyDownHandler,
		keypress: keyPressHandler
	});

	$scope.$on("$destroy", function() {
		$(document).off({
			click: clickHandler,
			keydown: keyDownHandler,
			keypress: keyPressHandler
		});
	});
});