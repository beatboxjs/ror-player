angular.module("beatbox")
	.controller("bbPatternEditorCtrl", function($scope, tuneName, patternName, bbConfig) {
		$scope.tuneName = tuneName;
		$scope.patternName = patternName;

		$scope.tune = bbConfig.tunes[tuneName];
		$scope.pattern = $scope.tune.patterns[patternName];
	})
	.factory("bbPatternEditorDialog", function($modal, bbPlayer) {
		return {
			editPattern: function(tuneName, patternName) {
				$modal.open({
					templateUrl: "app/shared/pattern-editor-dialog/pattern-editor-dialog.html",
					controller: "bbPatternEditorCtrl",
					size: "lg",
					windowClass: "bb-pattern-editor-dialog-window",
					resolve: {
						tuneName: function() { return tuneName },
						patternName: function() { return patternName }
					}
				}).result.then(function() {
					bbPlayer.stopAll();
				}, function() {
					bbPlayer.stopAll();
				})
			}
		};
	});