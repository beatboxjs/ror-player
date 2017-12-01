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
		return bbConfig.appName;
	};

	$scope.getDownloadFilename = function() {
		return $scope.getAppName().toLowerCase().replace(/[-_ ]+/g, "-") + '.html';
	};

	$scope.togglePatternList = function() {
		$("body").toggleClass("bb-pattern-list-visible");
	};

	function onResize() {
		$("#song-player .song-player-container").css("top", $("#song-player .control-panel").outerHeight(true) + "px");
	}

	$(window).resize(onResize);
	setTimeout(onResize, 0);
	$scope.$watch(onResize, function(){});

	$scope.$on("draggable:start", function(evt, obj) {
		if(obj.data.bbDragType == "pattern-placeholder") {
			$("body").removeClass("bb-pattern-list-visible");
		}
	});

	//$scope.$watch(function() { console.log("digest"); }, function() {})

});