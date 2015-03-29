angular.module("ror-simulator")
	.directive("rorPatternPlaceholder", function() {
		return {
			templateUrl: "app/shared/pattern-placeholder/pattern-placeholder.html",
			controller: "RorPatternPlaceholderController",
			scope: {
				tuneName: "=rorTuneName",
				patternName: "=rorPatternName",
				clickHandler: "&rorPatternClick",
				draggable: "=rorDraggable",
				dragSuccess: "&rorDragSuccess"
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
	.directive("rorPatternPlaceholderItem", function() {
		return {
			templateUrl: "app/shared/pattern-placeholder/pattern-placeholder-item.html",
			scope: {
				label: "=rorLabel"
			},
			replace: true,
			transclude: true
		};
	})
	.controller("RorPatternPlaceholderController", function($scope, RorConstants, PatternEditorDialog) {
		$scope.ror = RorConstants;

		$scope.click = function() {
			if($scope.clickHandler() != false)
				$scope.editPattern();
		};

		$scope.editPattern = function() {
			PatternEditorDialog.editPattern($scope.tuneName, $scope.patternName);
		};

		// On drop, dragdrop will exchange the drag-model with the drop-model. It thus needs something to write to.
		$scope.$watchGroup([ "tuneName", "patternName", "dragModel" ], function() {
			if(!$scope.dragModel)
				$scope.dragModel = new Array(2);
			$scope.dragModel[0] = $scope.tuneName;
			$scope.dragModel[1] = $scope.patternName;
		});
	});