import app from "../../app";

app.factory("bbMaestrationDialog", function($uibModal, bbPlayer) {
	var openDialog = null;

	return {
		open: function(state) {
			this.close();

			openDialog = $uibModal.open({
				template: require("./maestration-dialog.html"),
				controller: "bbMaestrationDialogCtrl",
				size: "lg",
				windowClass: "bb-pattern-editor-dialog",
				resolve: {
					state: function() { return state; }
				}
			});

			return openDialog;
		},
		close: function() {
			if(openDialog)
				openDialog.close();
		}
	};
});

app.controller("bbMaestrationDialogCtrl", function(state, $scope) {
	$scope.state = state;
});