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
				getPlayerOptions: "&bbPlayerOptions"
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
			scope: {
				label: "=bbLabel"
			},
			replace: true,
			transclude: true
		};
	})
	.controller("bbPatternPlaceholderController", function($scope, bbConfig, bbPatternEditorDialog, bbPlayer, bbUtils) {
		$scope.config = bbConfig;
		$scope.player = null;

		$scope.click = function() {
			if($scope.clickHandler() != false)
				$scope.editPattern();
		};

		$scope.editPattern = function() {
			bbPatternEditorDialog.editPattern($scope.tuneName, $scope.patternName);
		};

		$scope.playPattern = function() {
			if($scope.player == null)
				$scope.player = bbPlayer.createBeatbox(false);

			if(!$scope.player.playing) {
				var playerOptions = $scope.getPlayerOptions() || { };
				var pattern = bbPlayer.patternToBeatbox(bbUtils.getPattern($scope.tuneName, $scope.patternName), playerOptions.headphones, playerOptions.mute);

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
			ret.bbDragPatternPlaceholder = true;
			return ret;
		};

		// On drop, dragdrop will exchange the drag-model with the drop-model. It thus needs something to write to.
		$scope.$watchGroup([ "tuneName", "patternName", "dragModel" ], function() {
			if(!$scope.dragModel)
				$scope.dragModel = new Array(2);
			$scope.dragModel[0] = $scope.tuneName;
			$scope.dragModel[1] = $scope.patternName;
		});
	});