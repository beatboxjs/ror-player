angular.module("ror-simulator")
	.directive("rorPatternList", function() {
		return {
			templateUrl: "app/shared/pattern-list/pattern-list.html",
			controller: "RorPatternListController"
		};
	})
	.controller("RorPatternListController", function($scope, RorConstants, $modal) {
		$scope.tunes = RorConstants.tunes;

		$scope.editPattern = function(tuneName, patternName) {
			$modal.open({
				templateUrl: "app/components/patternEditor/patternEditor.html",
				controller: "patternEditorCtrl",
				size: "lg",
				resolve: {
					tuneName: function() { return tuneName },
					patternName: function() { return patternName }
				}
			})
		};
	});