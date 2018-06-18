import app from "../../../app";
import "./pattern-placeholder.scss";

app.directive("bbPatternPlaceholder", function($templateRequest, $compile, $rootScope, $) {
	var cloneInitialised = false;

	return {
		template: require("./pattern-placeholder.html"),
		controller: "bbPatternPlaceholderController",
		scope: {
			tuneName: "=bbTuneName",
			patternName: "=bbPatternName",
			clickHandler: "&bbPatternClick",
			draggable: "=bbDraggable",
			dragSuccess: "&bbDragSuccess",
			getPlaybackSettings: "&bbSettings",
			state: "=bbState"
		},
		transclude: true,
		replace: true,
		compile: function() {
			return {
				post: function(scope, el, attrs) {
					$("ng-transclude", el).replaceWith(function() { return $(this).contents(); });

					if(!cloneInitialised) {
						cloneInitialised = true;
						$compile($(require("./pattern-placeholder-drag.html")).appendTo("body"))($rootScope);
					}
				}
			}
		}
	};
});

app.directive("bbPatternPlaceholderItem", function() {
	return {
		template: require("./pattern-placeholder-item.html"),
		replace: true,
		transclude: true
	};
});

app.controller("bbPatternPlaceholderController", function($scope, bbConfig, bbPatternEditorDialog, bbPlayer, bbUtils, $element, ng, bbDefaultTunes, $, bbPlaybackSettings) {
	$scope.config = bbConfig;
	$scope.player = null;

	$scope.click = function() {
		if($scope.clickHandler() != false)
			$scope.editPattern();
	};

	$scope.editPattern = function() {
		var loadingEl = $("<div/>").addClass("bb-loading").appendTo("body");

		var watcher = $scope.$watch(function() {
			return $(".bb-pattern-editor-dialog .instrument-operations").length != 0;
		}, function(it) {
			if(it) {
				loadingEl.remove()
				watcher();
			}
		});

		setTimeout(function() {
			bbPatternEditorDialog.editPattern($scope.state, $scope.tuneName, $scope.patternName);
		}, 0);
	};

	var onbeat = function(beat) {
		$(".position-marker", $element).css("left", (beat / $scope.player._pattern.length) * $element.outerWidth() + "px");
	};

	var updatePlayer = function() {
		var patternObj = $scope.state.getPattern($scope.tuneName, $scope.patternName);
		var playbackSettings = $scope.getPlaybackSettings() || new bbPlaybackSettings({
			speed: patternObj.speed,
			loop: patternObj.loop
		});
		var pattern = bbPlayer.patternToBeatbox(patternObj, playbackSettings);

		if(playbackSettings.length)
			pattern = pattern.slice(0, playbackSettings.length*bbConfig.playTime);

		$scope.player.setPattern(pattern);
		$scope.player.setBeatLength(60000/playbackSettings.speed/bbConfig.playTime);
		$scope.player.setRepeat(playbackSettings.loop);
	};

	$scope.playPattern = function() {
		if($scope.player == null) {
			$scope.player = bbPlayer.createBeatbox(false);
			$scope.player.onbeat = onbeat;

			$scope.$watch("getPlaybackSettings()", updatePlayer, true);
			$scope.$watch("state.getPattern(tuneName, patternName)", updatePlayer, true);

			updatePlayer();
		}

		if(!$scope.player.playing) {
			bbPlayer.stopAll();
			$scope.player.setPosition(0);
			$scope.player.play();
		} else {
			$scope.player.stop();
			$scope.player.setPosition(0);
		}
	};

	var dragDataCache = {};
	$scope.getDragData = function(tuneName, patternName) {
		dragDataCache[tuneName] = dragDataCache[tuneName] || {};

		if(!dragDataCache[tuneName][patternName]) {
			dragDataCache[tuneName][patternName] = [ tuneName, patternName ];
			dragDataCache[tuneName][patternName].bbDragType = "pattern-placeholder";
			dragDataCache[tuneName][patternName].bbState = $scope.state;
		}

		return dragDataCache[tuneName][patternName];
	};

	// On drop, dragdrop will exchange the drag-model with the drop-model. It thus needs something to write to.
	$scope.$watchGroup([ "tuneName", "patternName", "dragModel" ], function() {
		if(!$scope.dragModel)
			$scope.dragModel = new Array(2);
		$scope.dragModel[0] = $scope.tuneName;
		$scope.dragModel[1] = $scope.patternName;
	});

	$scope.$watch(function() {
		return {
			original: bbDefaultTunes.getPattern($scope.tuneName, $scope.patternName),
			current: $scope.state && $scope.state.getPattern($scope.tuneName, $scope.patternName)
		}
	}, function(obj) {
		if(!$scope.state) // In uninitialised clone
			return;

		$scope.hasLocalChanges = obj.original && !obj.current.equals(obj.original);
	}, true);

	$scope.restore = function() {
		bbUtils.confirm("Are you sure that you want to revert your modifications to "+$scope.patternName+" ("+$scope.tuneName+")?").then(function() {
			var originalPattern = bbDefaultTunes.getPattern($scope.tuneName, $scope.patternName);
			var pattern = $scope.state.getPattern($scope.tuneName, $scope.patternName);
			ng.copy(originalPattern, pattern);
		});
	};
});