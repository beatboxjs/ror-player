angular.module("ror-simulator")
	.directive("rorPatternList", function() {
		return {
			templateUrl: "app/shared/pattern-list/pattern-list.html",
			controller: "RorPatternListController",
			scope: {
				clickHandler: "&rorPatternClick"
			}
		};
	})
	.controller("RorPatternListController", function($scope, RorConstants, PatternEditorDialog) {
		$scope.ror = RorConstants;

		$scope.patternClick = function(tuneName, patternName) {
			return $scope.clickHandler({ patternName: patternName, tuneName: tuneName });
		};

		$scope.createPattern = function() {
			var patternName = prompt("Please enter a name for the new break.");
			if(!patternName)
				return;

			while(patternName && RorConstants.myTunes.patterns[patternName])
				patternName = prompt("This name is already taken. Please enter a new one.");
			if(!patternName)
				return;

			RorConstants.myTunes.patterns[patternName] = {
				length: 4,
				time: 4
			};

			for(var i in RorConstants.instruments)
				RorConstants.myTunes.patterns[patternName][i] = [ ];

			PatternEditorDialog.editPattern(RorConstants.myTunesKey, patternName);
		};

		$scope.removePattern = function(tuneName, patternName) {
			delete RorConstants.tunes[tuneName].patterns[patternName];
		};
	});