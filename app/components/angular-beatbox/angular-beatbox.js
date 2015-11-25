angular.module("beatbox").controller("BeatboxController", function($scope, bbUtils, bbConfig, ng, bbHistory, $document, $) {
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

	$scope.getAppName = function() {
		return $document[0].title;
	};

	$scope.getDownloadFilename = function() {
		return $scope.getAppName().toLowerCase().replace(/[-_ ]+/g, "-");
	};

	//$scope.$watch(function() { console.log("digest"); }, function() {})

});