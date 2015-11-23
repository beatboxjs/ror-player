angular.module("beatbox").controller("BeatboxController", function($scope, bbUtils, bbConfig, ng, bbHistory) {
	$scope.tunes = bbHistory.tunes;
	$scope.songs = bbHistory.songs;
	$scope.song = $scope.songs[0];
	$scope.bbHistory = bbHistory;

	$scope.patternClick = function(tuneName, patternName) {
		var songPart = { };
		ng.forEach(Object.keys(bbConfig.instruments), function(instrumentKey) {
			songPart[instrumentKey] = [ tuneName, patternName ];
		});

		var newIdx = bbUtils.getSongLength($scope.song, $scope.tunes);
		$scope.song[newIdx] = songPart;

		setTimeout(function() {
			bbUtils.scrollToElement($("#song-player .song-container"), false, true);
		}, 0);

		return false;
	};

	//$scope.$watch(function() { console.log("digest"); }, function() {})

});