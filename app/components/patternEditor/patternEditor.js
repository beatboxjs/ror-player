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

	$scope.playPause = function() {
		if(!$scope.playing)
			$scope.playing = Player.playPattern($scope.pattern, 100);
		else if($scope.playing.playing)
			$scope.playing.stop();
		else
			$scope.playing.start();
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

	$scope.getBeatClass = function(i) {
		return {
			'before-bar': i%4 == 3,
			bar: i%4 == 0
		};
	};

	$scope.getStrokeClass = function(i) {
		return [
			"stroke-"+(i%$scope.pattern.measure),
			{
				'before-beat': (i+1)%$scope.pattern.measure == 0,
				beat: i%$scope.pattern.measure == 0,
				'before-bar': (i+1)%($scope.pattern.measure*4) == 0,
				bar: i%($scope.pattern.measure*4) == 0
			}
	];
};
});