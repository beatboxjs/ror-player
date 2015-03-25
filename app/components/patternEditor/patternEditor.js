angular.module("ror-simulator").controller("patternEditorCtrl", function($scope, Tunes, tuneName, patternName, Player) {
	$scope.tuneName = tuneName;
	$scope.patternName = patternName;

	$scope.tune = $scope.tunes[tuneName];
	$scope.pattern = $scope.tune.patterns[patternName];
	$scope.speed = 100;

	$scope.getNumber = function(num) {
		return new Array(num);
	};

	$scope.playing = null;

	$scope.play = function() {
		$scope.playing = Player.playPattern($scope.pattern, 100);
	};

	$scope.stop = function() {
		if($scope.playing) {
			$scope.playing.stop();
			$scope.playing = null;
		}
	};

	$scope.$watch("speed", function(newSpeed) {
		if($scope.playing)
			$scope.playing.setSpeed(newSpeed);
	});
});