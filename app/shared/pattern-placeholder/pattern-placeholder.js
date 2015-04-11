angular.module("beatbox")
	.directive("bbPatternPlaceholder", function() {
		return {
			templateUrl: "app/shared/pattern-placeholder/pattern-placeholder.html",
			controller: "bbPatternPlaceholderController",
			scope: {
				tuneName: "=bbTuneName",
				patternName: "=bbPatternName",
				clickHandler: "&bbPatternClick",
				draggable: "=bbDraggable",
				dragSuccess: "&bbDragSuccess"
			},
			transclude: true,
			replace: true,
			compile: function() {
				return {
					post: function(scope, el, attrs) {
						$("ng-transclude", el).replaceWith(function() { return $(this).contents(); });
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
	.controller("bbPatternPlaceholderController", function($scope, bbConfig, bbPatternEditorDialog) {
		$scope.config = bbConfig;

		$scope.click = function() {
			if($scope.clickHandler() != false)
				$scope.editPattern();
		};

		$scope.editPattern = function() {
			bbPatternEditorDialog.editPattern($scope.tuneName, $scope.patternName);
		};

		// On drop, dragdrop will exchange the drag-model with the drop-model. It thus needs something to write to.
		$scope.$watchGroup([ "tuneName", "patternName", "dragModel" ], function() {
			if(!$scope.dragModel)
				$scope.dragModel = new Array(2);
			$scope.dragModel[0] = $scope.tuneName;
			$scope.dragModel[1] = $scope.patternName;
		});
	});