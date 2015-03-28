angular.module("ror-simulator").controller("patternEditorCtrl", function($scope, $modalInstance, Player, tuneName, patternName, RorConstants) {

	$scope.tuneName = tuneName;
	$scope.patternName = patternName;

	$scope.tune = RorConstants.tunes[tuneName];
	$scope.pattern = $scope.tune.patterns[patternName];

	$modalInstance.result.then(function() {
		Player.stopAll();
	}, function() {
		Player.stopAll();
	});
});