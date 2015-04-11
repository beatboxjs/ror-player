angular.module("beatbox").controller("BeatboxController", function($scope, bbUtils, bbConfig, ng) {
	$scope.song = localStorage.song ? JSON.parse(localStorage.song) : { };
	$scope.$watch("song", function(song) {
		localStorage.song = JSON.stringify(song);
	}, true);

	$scope.$watch(function() { return bbConfig.myTunes; }, function() {
		// Check if all patterns still exist
		for(var i in $scope.song) {
			for(var j in $scope.song[i]) {
				if(!bbUtils.getPattern($scope.song[i][j]))
					delete $scope.song[i][j];
			}
			if(Object.keys($scope.song[i]).length == 0)
				delete $scope.song[i];
		}
	}, true);


	$scope.patternClick = function(tuneName, patternName) {
		var songPart = { };
		ng.forEach(Object.keys(bbConfig.instruments), function(instrumentKey) {
			songPart[instrumentKey] = [ tuneName, patternName ];
		});
		$scope.song[bbUtils.getSongLength($scope.song)] = songPart;

		return false;
	};

	//$scope.$watch(function() { console.log("digest"); }, function() {})

});