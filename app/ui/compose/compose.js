import app from "../../app";
import "./compose.scss";

app.directive("bbCompose", function() {
	return {
		template: require("./compose.html"),
		scope: {},
		controller: "bbComposeController",
		replace: true
	};
});

app.controller("bbComposeController", function($scope, bbUtils, bbConfig, ng, bbHistory, $document, $) {
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
			bbUtils.scrollToElement($(".bb-song-player .song-container"), false, true);
		}, 0);

		return false;
	};

	$scope.$on("draggable:start", function(evt, obj) {
		if(obj.data.bbDragType == "pattern-placeholder") {
			$scope.$emit("bbOverview-closePatternList");
		}
	});

});