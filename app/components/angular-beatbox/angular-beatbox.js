angular.module("beatbox").controller("BeatboxController", function($scope, bbUtils, bbConfig, ng, bbState) {
	$scope.tunes = bbState.tunes;
	$scope.songs = bbState.songs;
	$scope.song = $scope.songs[0];

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

	$scope.getHistoricStates = function() {
		return bbState.getHistoricStates();
	};

	$scope.getHistoryKeyTitle = function(key) {
		return new Date(key*1000).toISOString();
	};

	$scope.loadHistoricState = function(key) {
		bbState.loadHistoricState(key);
	};

	//$scope.$watch(function() { console.log("digest"); }, function() {})

});