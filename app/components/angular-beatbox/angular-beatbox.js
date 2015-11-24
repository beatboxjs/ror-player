angular.module("beatbox").controller("BeatboxController", function($scope, bbUtils, bbConfig, ng, bbHistory) {
	$scope.state = bbHistory.state;

	$scope.patternClick = function(tuneName, patternName) {
		var song = $scope.state.songs[$scope.state.songIdx];
		if(!song)
			return;

		var songPart = { };
		for(var instr in bbConfig.instruments) {
			songPart[instr] = [ tuneName, patternName ];
		}

		var newIdx = song.getEffectiveLength($scope.state);
		song[newIdx] = songPart;

		setTimeout(function() {
			bbUtils.scrollToElement($("#song-player .song-container"), false, true);
		}, 0);

		return false;
	};

	//$scope.$watch(function() { console.log("digest"); }, function() {})

});