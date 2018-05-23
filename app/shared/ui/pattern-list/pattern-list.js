import app from "../../../app";
import "./pattern-list.scss";

app.directive("bbPatternList", function() {
	return {
		template: require("./pattern-list.html"),
		controller: "bbPatternListController",
		scope: {
			state: "=bbState"
		},
		transclude: true
	};
});

app.directive("bbPatternListTransclude", function() {
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
});

app.controller("bbPatternListController", function($scope, bbConfig, bbUtils, bbPatternEditorDialog, bbDefaultTunes, $uibModal, $filter) {
	$scope.utils = bbUtils;

	$scope.filter = { text: "", cat: "all" };

	$scope.filterCats = bbConfig.filterCats;

	$scope.isOpen = {};

	$scope.$watch("isOpen", function(newOpen, oldOpen) {
		for(var i in newOpen) {
			if(!!newOpen[i] != !!oldOpen[i])
				$scope.$emit(newOpen[i] ? "bbPatternList-tuneOpened" : "bbPatternList-tuneClosed", i);
		}
	}, true);

	$scope.$watch("filter", function() {
		var visibleTunes = $filter("bbPatternListFilter")($scope.state, $scope.filter);
		for(var i in $scope.isOpen) {
			if($scope.isOpen[i] && visibleTunes.indexOf(i) == -1)
				$scope.$emit("bbPatternList-tuneClosed", i);
		}
	}, true);

	$scope.$on("bbPatternList-openTune", function(e, tuneName) {
		if(!$scope.state.tunes[tuneName])
			return;

		$scope.isOpen[tuneName] = true;

		if($filter("bbPatternListFilter")($scope.state, $scope.filter).indexOf(tuneName) == -1)
			$scope.filter = { text: "", cat: $scope.isCustomTune(tuneName) ? "custom" : ($scope.state.tunes[tuneName].categories[0] || "all") };
	});

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
			template: require("./rename-pattern-dialog.html"),
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

			$scope.isOpen[newTuneName] = true;
			$scope.filter = { text: "", cat: "custom" };
		});
	};

	$scope.renameTune = function(tuneName) {
		bbUtils.prompt("Rename tune", tuneName, function(newTuneName) {
			if(newTuneName.trim().length == 0 || newTuneName == tuneName)
				return "Please enter a new name for the tune.";
			if($scope.state.tunes[newTuneName])
				return "This name is already taken. Please enter a different one.";
		}).then(function(newTuneName) {
			$scope.state.renameTune(tuneName, newTuneName);
		});
	};

	$scope.copyTune = function(tuneName) {
		bbUtils.prompt("Copy tune", tuneName, function(newTuneName) {
			if(newTuneName.trim().length == 0 || newTuneName == tuneName)
				return "Please enter a new name for the tune.";
			if($scope.state.tunes[newTuneName])
				return "This name is already taken. Please enter a different one.";
		}).then(function(newTuneName) {
			$scope.state.copyTune(tuneName, newTuneName);
		});
	};

	$scope.removeTune = function(tuneName) {
		bbUtils.confirm("Do you really want to remove the tune " + tuneName + "?").then(function() {
			$scope.state.removeTune(tuneName);
		});
	};
});

app.filter("bbPatternListFilter", function() {
	return function(state, params) {
		var ret = [ ];
		var tuneNames = state.getSortedTuneList();
		var text = params.text.trim().toLowerCase();
		for(var i=0; i<tuneNames.length; i++) {
			if(text ? (tuneNames[i].toLowerCase().indexOf(text) != -1) : state.tunes[tuneNames[i]].isInCategory(params.cat))
				ret.push(tuneNames[i]);
		}
		return ret;
	};
});