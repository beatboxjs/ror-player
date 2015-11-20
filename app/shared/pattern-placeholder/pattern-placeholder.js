angular.module("beatbox")
	.directive("bbPatternPlaceholder", function($templateRequest, $compile, $rootScope) {
		var cloneInitialised = false;

		return {
			templateUrl: "app/shared/pattern-placeholder/pattern-placeholder.html",
			controller: "bbPatternPlaceholderController",
			scope: {
				tuneName: "=bbTuneName",
				patternName: "=bbPatternName",
				clickHandler: "&bbPatternClick",
				draggable: "=bbDraggable",
				dragSuccess: "&bbDragSuccess",
				getPlayerOptions: "&bbPlayerOptions",
				tunes: "=bbTunes"
			},
			transclude: true,
			replace: true,
			compile: function() {
				return {
					post: function(scope, el, attrs) {
						$("ng-transclude", el).replaceWith(function() { return $(this).contents(); });

						if(!cloneInitialised) {
							cloneInitialised = true;
							$templateRequest("app/shared/pattern-placeholder/pattern-placeholder-drag.html").then(function(template) {
								$compile($(template).appendTo("body"))($rootScope);
							});
						}
					}
				}
			}
		};
	})
	.directive("bbPatternPlaceholderItem", function() {
		return {
			templateUrl: "app/shared/pattern-placeholder/pattern-placeholder-item.html",
			replace: true,
			transclude: true
		};
	})
	.controller("bbPatternPlaceholderController", function($scope, bbConfig, bbPatternEditorDialog, bbPlayer, bbUtils, $element, ng, $ngBootbox, bbState) {
		$scope.config = bbConfig;
		$scope.player = null;

		$scope.click = function() {
			if($scope.clickHandler() != false)
				$scope.editPattern();
		};

		$scope.editPattern = function() {
			var loadingEl = $("<div/>").addClass("bb-loading").appendTo("body");

			var watcher = $scope.$watch(function() {
				return $(".bb-pattern-editor-dialog .instrument-operations").size() != 0;
			}, function(it) {
				if(it) {
					loadingEl.remove()
					watcher();
				}
			});

			setTimeout(function() {
				bbPatternEditorDialog.editPattern($scope.tunes, $scope.tuneName, $scope.patternName);
			}, 0);
		};

		var onbeat = function(beat) {
			$(".position-marker", $element).css("left", (beat / $scope.player._pattern.length) * $element.outerWidth() + "px");
		};

		$scope.playPattern = function() {
			if($scope.player == null) {
				$scope.player = bbPlayer.createBeatbox(false);
				$scope.player.onbeat = onbeat;
			}

			if(!$scope.player.playing) {
				var playerOptions = $scope.getPlayerOptions() || { };
				var pattern = bbPlayer.patternToBeatbox(bbUtils.getPattern($scope.tunes, $scope.tuneName, $scope.patternName), playerOptions.headphones, playerOptions.mute);

				if(playerOptions.length)
					pattern = pattern.slice(0, playerOptions.length*bbConfig.playTime);

				$scope.player.setPattern(pattern);
				$scope.player.setBeatLength(60000/(playerOptions.speed || 100)/bbConfig.playTime);
				$scope.player.play();
			} else {
				$scope.player.stop();
				$scope.player.setPosition(0);
			}
		};

		$scope.getDragData = function(tuneName, patternName) {
			var ret = [ tuneName, patternName ];
			ret.bbDragType = "pattern-placeholder";
			return ret;
		};

		// On drop, dragdrop will exchange the drag-model with the drop-model. It thus needs something to write to.
		$scope.$watchGroup([ "tuneName", "patternName", "dragModel" ], function() {
			if(!$scope.dragModel)
				$scope.dragModel = new Array(2);
			$scope.dragModel[0] = $scope.tuneName;
			$scope.dragModel[1] = $scope.patternName;
		});

		$scope.hasLocalChanges = function() {
			var originalPattern = bbConfig.tunes[$scope.tuneName] && bbConfig.tunes[$scope.tuneName].patterns[$scope.patternName];
			var pattern = bbState.tunes[$scope.tuneName] && bbState.tunes[$scope.tuneName].patterns[$scope.patternName];
			return originalPattern && !ng.equals(pattern, originalPattern);
		};

		$scope.restore = function() {
			$ngBootbox.confirm("Are you sure that you want to revert your modifications to "+$scope.patternName+" ("+$scope.tuneName+")?").then(function() {
				var originalPattern = bbConfig.tunes[$scope.tuneName] && bbConfig.tunes[$scope.tuneName].patterns[$scope.patternName];
				var pattern = bbState.tunes[$scope.tuneName].patterns[$scope.patternName];
				ng.copy(originalPattern, pattern);
			});
		};
	});