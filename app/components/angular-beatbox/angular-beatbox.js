angular.module("beatbox").controller("BeatboxController", function($scope, bbUtils, bbConfig, ng) {
	$scope.songs = localStorage.songs ? JSON.parse(localStorage.songs) : [ ];
	if (localStorage.song) { // Legacy
		$scope.songs.push(JSON.parse(localStorage.song));
		delete localStorage.song;
	}

	$scope.song = $scope.songs[0];

	$scope.$watch("songs", function(songs) {
		localStorage.songs = JSON.stringify(songs);
	}, true);

	$scope.$watch(function() { return bbConfig.myTunes; }, function() {
		// Check if all patterns still exist
		for(var i=0; i<$scope.songs.length; i++) {
			for(var j in $scope.songs[i]) {
				if(j == "name")
					continue;

				for(var k in $scope.songs[i][j]) {
					if(!bbUtils.getPattern($scope.songs[i][j][k]))
						delete $scope.songs[i][j][k];
				}
				if(Object.keys($scope.songs[i][j]).length == 0)
					delete $scope.song[i][j];
			}
		}
	}, true);


	$scope.patternClick = function(tuneName, patternName) {
		var songPart = { };
		ng.forEach(Object.keys(bbConfig.instruments), function(instrumentKey) {
			songPart[instrumentKey] = [ tuneName, patternName ];
		});

		var newIdx = bbUtils.getSongLength($scope.song);
		$scope.song[newIdx] = songPart;

		setTimeout(function() {
			bbUtils.scrollToElement($("#song-player .song-container"), false, true);
		}, 0);

		return false;
	};

	//$scope.$watch(function() { console.log("digest"); }, function() {})

});