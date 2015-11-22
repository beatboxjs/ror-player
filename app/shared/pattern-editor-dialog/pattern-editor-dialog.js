angular.module("beatbox")
	.controller("bbPatternEditorCtrl", function($scope, tuneName, patternName, bbConfig, tunes) {
		$scope.tuneName = tuneName;
		$scope.patternName = patternName;

		$scope.tune = tunes[tuneName];
		$scope.pattern = $scope.tune.patterns[patternName];

		$scope.originalPattern = bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName].patterns[patternName];
	})
	.factory("bbPatternEditorDialog", function($uibModal, bbPlayer) {
		var openDialog = null;

		return {
			editPattern: function(tunes, tuneName, patternName) {
				this.close();

				openDialog = $uibModal.open({
					templateUrl: "app/shared/pattern-editor-dialog/pattern-editor-dialog.html",
					controller: "bbPatternEditorCtrl",
					size: "lg",
					windowClass: "bb-pattern-editor-dialog",
					resolve: {
						tunes: function() { return tunes; },
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