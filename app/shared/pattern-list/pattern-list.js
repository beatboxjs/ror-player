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
	.controller("bbPatternListController", function($scope, bbConfig, bbUtils, bbPatternEditorDialog, $ngBootbox) {
		$scope.config = bbConfig;
		$scope.utils = bbUtils;

		$scope.createPattern = function() {
			var patternName;
			async.doWhilst(function(next) {
				$ngBootbox.prompt(!patternName ? "Please enter a name for the new break." : "This name is already taken. Please enter a new one.").then(function(newPatternName) {
					patternName = newPatternName;
					next();
				});
			}, function() {
				return patternName == "" || bbConfig.myTunes.patterns[patternName];
			}, function() {
				bbConfig.myTunes.patterns[patternName] = {
					length: 4,
					time: 4
				};

				for(var i in bbConfig.instruments)
					bbConfig.myTunes.patterns[patternName][i] = [ ];

				bbPatternEditorDialog.editPattern(bbConfig.myTunesKey, patternName);
			});
		};

		$scope.removePattern = function(tuneName, patternName) {
			$ngBootbox.confirm("Do you really want to remove "+patternName+" ("+tuneName+")?").then(function(){
				delete bbConfig.tunes[tuneName].patterns[patternName];
			});
		};
	});