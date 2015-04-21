angular.module("beatbox")
	.directive("bbPatternList", function() {
		return {
			templateUrl: "app/shared/pattern-list/pattern-list.html",
			controller: "bbPatternListController",
			scope: {
			},
			transclude: true
		};
	})
	.directive("bbPatternListTransclude", function() {
		return {
			link: function(scope, el, attrs, ctrl, $transclude) {
				var newScope = scope.$parent.$new();
				var inject = scope.$eval(attrs.bbScope);
				for(var i in inject) {
					newScope[i] = inject[i];
				}
				$transclude(newScope, function(clone) {
					el.replaceWith(clone);
				});
			}
		}
	})
	.controller("bbPatternListController", function($scope, bbConfig, bbUtils, bbPatternEditorDialog) {
		$scope.config = bbConfig;
		$scope.utils = bbUtils;

		$scope.createPattern = function() {
			var patternName = prompt("Please enter a name for the new break.");
			if(!patternName)
				return;

			while(patternName && bbConfig.myTunes.patterns[patternName])
				patternName = prompt("This name is already taken. Please enter a new one.");
			if(!patternName)
				return;

			bbConfig.myTunes.patterns[patternName] = {
				length: 4,
				time: 4
			};

			for(var i in bbConfig.instruments)
				bbConfig.myTunes.patterns[patternName][i] = [ ];

			bbPatternEditorDialog.editPattern(bbConfig.myTunesKey, patternName);
		};

		$scope.removePattern = function(tuneName, patternName) {
			delete bbConfig.tunes[tuneName].patterns[patternName];
		};
	});