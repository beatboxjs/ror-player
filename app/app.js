angular.module("ror-simulator", ["ui.bootstrap", "ui.bootstrap-slider"])
	.controller("PlayerCtrl", function($scope, RorConstants, $modal) {
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
	})
	.constant("$", jQuery)
	.constant("ng", angular);