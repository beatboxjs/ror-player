angular.module("beatbox")
	.directive("bbPatternList", function() {
		return {
			templateUrl: "app/shared/pattern-list/pattern-list.html",
			controller: "bbPatternListController",
			scope: {
				tunes: "=bbTunes"
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
		$scope.myTunesKey = bbConfig.myTunesKey;
		$scope.utils = bbUtils;

		$scope.createPattern = function() {
			var patternName;
			async.doWhilst(function(next) {
				$ngBootbox.prompt(!patternName ? "Please enter a name for the new break." : "This name is already taken. Please enter a new one.").then(function(newPatternName) {
					patternName = newPatternName;
					next();
				});
			}, function() {
				return patternName == "" || $scope.tunes[bbConfig.myTunesKey].patterns[patternName];
			}, function() {
				$scope.tunes[bbConfig.myTunesKey].patterns[patternName] = {
					length: 4,
					time: 4
				};

				for(var i in bbConfig.instruments)
					$scope.tunes[bbConfig.myTunesKey].patterns[patternName][i] = [ ];

				bbPatternEditorDialog.editPattern($scope.tunes, bbConfig.myTunesKey, patternName);
			});
		};

		$scope.removePattern = function(tuneName, patternName) {
			$ngBootbox.confirm("Do you really want to remove "+patternName+" ("+tuneName+")?").then(function(){
				delete $scope.tunes[tuneName].patterns[patternName];
			});
		};
	});