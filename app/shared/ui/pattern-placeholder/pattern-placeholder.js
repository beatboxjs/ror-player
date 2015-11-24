angular.module("beatbox")
	.directive("bbPatternPlaceholder", function($templateRequest, $compile, $rootScope) {
		var cloneInitialised = false;

		return {
			templateUrl: "app/shared/ui/pattern-placeholder/pattern-placeholder.html",
			controller: "bbPatternPlaceholderController",
			scope: {
				tuneName: "=bbTuneName",
				patternName: "=bbPatternName",
				clickHandler: "&bbPatternClick",
				draggable: "=bbDraggable",
				dragSuccess: "&bbDragSuccess",
				getPlayerOptions: "&bbPlayerOptions",
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
							$templateRequest("app/shared/ui/pattern-placeholder/pattern-placeholder-drag.html").then(function(template) {
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
			templateUrl: "app/shared/ui/pattern-placeholder/pattern-placeholder-item.html",
			replace: true,
			transclude: true
		};
	})
	.controller("bbPatternPlaceholderController", function($scope, bbConfig, bbPatternEditorDialog, bbPlayer, bbUtils, $element, ng, $ngBootbox, bbDefaultTunes) {
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
				bbPatternEditorDialog.editPattern($scope.state, $scope.tuneName, $scope.patternName);
			}, 0);
		};

		var onbeat = function(beat) {
			$(".position-marker", $element).css("left", (beat / $scope.player._pattern.length) * $element.outerWidth() + "px");
		};

		var updatePlayer = function() {
			var playerOptions = $scope.getPlayerOptions() || { };
			var pattern = bbPlayer.patternToBeatbox($scope.state.getPattern($scope.tuneName, $scope.patternName), playerOptions.headphones, playerOptions.mute);

			if(playerOptions.length)
				pattern = pattern.slice(0, playerOptions.length*bbConfig.playTime);

			$scope.player.setPattern(pattern);
			$scope.player.setBeatLength(60000/(playerOptions.speed || $scope.state.speed)/bbConfig.playTime);
			$scope.player.setRepeat(!!playerOptions.loop);
		};

		$scope.playPattern = function() {
			if($scope.player == null) {
				$scope.player = bbPlayer.createBeatbox(false);
				$scope.player.onbeat = onbeat;

				$scope.$watch("getPlayerOptions()", updatePlayer, true);
				$scope.$watch("state.speed", updatePlayer);
				$scope.$watch("state.getPattern(tuneName, patternName)", updatePlayer, true);

				updatePlayer();
			}

			if(!$scope.player.playing)
				$scope.player.play();
			else {
				$scope.player.stop();
				$scope.player.setPosition(0);
			}
		};

		$scope.getDragData = function(tuneName, patternName) {
			var ret = [ tuneName, patternName ];
			ret.bbDragType = "pattern-placeholder";
			ret.bbState = $scope.state;
			return ret;
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
			$ngBootbox.confirm("Are you sure that you want to revert your modifications to "+$scope.patternName+" ("+$scope.tuneName+")?").then(function() {
				var originalPattern = bbDefaultTunes.getPattern($scope.tuneName, $scope.patternName);
				var pattern = $scope.state.getPattern($scope.tuneName, $scope.patternName);
				ng.copy(originalPattern, pattern);
			});
		};
	});