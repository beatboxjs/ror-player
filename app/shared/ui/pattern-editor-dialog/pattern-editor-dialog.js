angular.module("beatbox")
	.controller("bbPatternEditorCtrl", function($scope, tuneName, patternName, state, bbDefaultTunes, bbShareDialog) {
		$scope.tuneName = tuneName;
		$scope.patternName = patternName;

		$scope.state = state;

		$scope.pattern = state.getPattern(tuneName, patternName);
		$scope.originalPattern = bbDefaultTunes.getPattern(tuneName, patternName);

		$scope.share = function() {
			bbShareDialog.openDialog(state, [ tuneName, patternName ]);
		};
	})
	.factory("bbPatternEditorDialog", function($uibModal, bbPlayer) {
		var openDialog = null;

		return {
			editPattern: function(state, tuneName, patternName) {
				this.close();

				openDialog = $uibModal.open({
					templateUrl: "app/shared/ui/pattern-editor-dialog/pattern-editor-dialog.html",
					controller: "bbPatternEditorCtrl",
					size: "lg",
					windowClass: "bb-pattern-editor-dialog",
					resolve: {
						state: function() { return state; },
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