angular.module("beatbox")
	.directive("bbPatternList", function() {
		return {
			templateUrl: "app/shared/ui/pattern-list/pattern-list.html",
			controller: "bbPatternListController",
			scope: {
				state: "=bbState"
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
	.controller("bbPatternListController", function($scope, bbConfig, bbUtils, bbPatternEditorDialog, bbDefaultTunes, $uibModal) {
		$scope.utils = bbUtils;

		$scope.createPattern = function(tuneName) {
			bbUtils.prompt("New break", "", function(newPatternName) {
				if(newPatternName.trim().length == 0)
					return "Please enter a name for the new break.";
				if($scope.state.getPattern(tuneName, newPatternName))
					return "This name is already taken. Please enter a different one.";
			}).then(function(newPatternName) {
				$scope.state.createPattern(tuneName, newPatternName);
				bbPatternEditorDialog.editPattern($scope.tunes, tuneName, newPatternName);
			});
		};

		$scope.copyPattern = function(tuneName, patternName) {
			var scope = $scope.$new();

			scope.tuneName = $scope.originalTuneName = tuneName;
			scope.patternName = $scope.originalPatternName = patternName;
			scope.copy = "1";

			scope.exists = function() {
				return !!$scope.state.getPattern(this.tuneName, this.patternName);
			};

			scope.changed = function() {
				return (this.tuneName != tuneName || this.patternName != patternName) && this.patternName.trim() != "";
			};

			scope.ok = function() {
				this.$close();

				$scope.state[this.copy ? "copyPattern" : "movePattern"]([ tuneName, patternName ], [ this.tuneName, this.patternName ]);
			};

			scope.cancel = function() {
				this.$close();
			};

			$uibModal.open({
				templateUrl: "app/shared/ui/pattern-list/rename-pattern-dialog.html",
				scope: scope
			});
		};

		$scope.removePattern = function(tuneName, patternName) {
			bbUtils.confirm("Do you really want to remove "+patternName+" ("+tuneName+")?").then(function(){
				$scope.state.removePattern(tuneName, patternName);
			});
		};

		$scope.isCustomPattern = function(tuneName, patternName) {
			return !bbDefaultTunes.getPattern(tuneName, patternName);
		};

		$scope.isCustomTune = function(tuneName) {
			return bbDefaultTunes[tuneName] == null;
		};

		$scope.createTune = function() {
			bbUtils.prompt("Create tune", "", function(newTuneName) {
				if(newTuneName.trim().length == 0)
					return "Please enter a name for the new tune.";
				if($scope.state.tunes[newTuneName])
					return "This name is already taken. Please enter a different one.";
			}).then(function(newTuneName) {
				$scope.state.createTune(newTuneName);
			});
		};
	});