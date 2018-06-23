import app from "../../app";
import "./pattern-editor-dialog.scss";

app.controller("bbPatternEditorCtrl", function($scope, tuneName, patternName, state, bbDefaultTunes, bbShareDialog, readonly, player) {
	$scope.tuneName = tuneName;
	$scope.patternName = patternName;
	$scope.readonly = readonly;
	$scope.player = player;

	$scope.state = state;

	$scope.pattern = state.getPattern(tuneName, patternName);
	$scope.originalPattern = bbDefaultTunes.getPattern(tuneName, patternName);

	$scope.share = function() {
		bbShareDialog.openDialog(state, [ tuneName, patternName ]);
	};
});

app.factory("bbPatternEditorDialog", function($uibModal, bbPlayer) {
	var openDialog = null;

	return {
		editPattern: function(state, tuneName, patternName, readonly, player) {
			this.close();

			if(!player)
				bbPlayer.stopAll();

			openDialog = $uibModal.open({
				template: require("./pattern-editor-dialog.html"),
				controller: "bbPatternEditorCtrl",
				size: "lg",
				windowClass: "bb-pattern-editor-dialog",
				resolve: {
					state: function() { return state; },
					tuneName: function() { return tuneName },
					patternName: function() { return patternName },
					readonly: function() { return readonly; },
					player: function() { return player; }
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