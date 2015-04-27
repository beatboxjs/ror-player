angular.module("beatbox")
	.controller("bbPatternEditorCtrl", function($scope, tuneName, patternName, bbConfig) {
		$scope.tuneName = tuneName;
		$scope.patternName = patternName;

		$scope.tune = bbConfig.tunes[tuneName];
		$scope.pattern = $scope.tune.patterns[patternName];
	})
	.factory("bbPatternEditorDialog", function($modal, bbPlayer) {
		var openDialog = null;

		return {
			editPattern: function(tuneName, patternName) {
				this.close();

				openDialog = $modal.open({
					templateUrl: "app/shared/pattern-editor-dialog/pattern-editor-dialog.html",
					controller: "bbPatternEditorCtrl",
					size: "lg",
					windowClass: "bb-pattern-editor-dialog-window",
					resolve: {
						tuneName: function() { return tuneName },
						patternName: function() { return patternName }
					}
				});

				openDialog.result.then(function() {
					bbPlayer.stopAll();
				}, function() {
					bbPlayer.stopAll();
				});

				return openDialog;
			},
			close: function() {
				if(openDialog)
					openDialog.close();
			}
		};
	});