var app = angular.module("ror-simulator", ["ui.bootstrap", "ui.bootstrap-slider"]);

app.controller("PlayerCtrl", function($scope, Tunes, $modal) {
	$scope.tunes = Tunes;

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

