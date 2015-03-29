angular.module("ror-simulator")
	.controller("patternEditorCtrl", function($scope, tuneName, patternName, RorConstants) {
		$scope.tuneName = tuneName;
		$scope.patternName = patternName;

		$scope.tune = RorConstants.tunes[tuneName];
		$scope.pattern = $scope.tune.patterns[patternName];
	})
	.factory("PatternEditorDialog", function($modal, Player) {
		return {
			editPattern: function(tuneName, patternName) {
				$modal.open({
					templateUrl: "app/shared/pattern-editor-dialog/pattern-editor-dialog.html",
					controller: "patternEditorCtrl",
					size: "lg",
					resolve: {
						tuneName: function() { return tuneName },
						patternName: function() { return patternName }
					}
				}).result.then(function() {
					Player.stopAll();
				}, function() {
					Player.stopAll();
				})
			}
		};
	});