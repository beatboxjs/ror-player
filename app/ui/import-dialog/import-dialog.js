import app from "../../app";
import "./import-dialog.scss";

app.controller("bbImportDialogCtrl", function($scope, state, bbUtils, bbState) {
	$scope.state = state;
	$scope.utils = bbUtils;

	$scope.importSongs = { };
	$scope.importPatterns = { };

	$scope.obj = null;
	$scope.error = null;

	$scope.$watch("pasted", function(pasted) {
		$scope.obj = null;
		$scope.error = null;
		$scope.warnings = [ ];

		if(!pasted)
			return;

		pasted = pasted.trim();

		try {
			var m;
			if(pasted.charAt(0) == "{" || (m = pasted.match(/#\/([-_a-zA-Z0-9]+)/))) {
				$scope.obj = new bbState({ });
				$scope.warnings = $scope.obj.extendFromCompressed(m ? bbUtils.stringToObject(m[1]) : JSON.parse(pasted), null, null, false, false, true);
			}
			else
				$scope.error = "Unrecognised format.";
		} catch(e) {
			$scope.error = "Error decoding pasted data: " + (e.message || e);
		}
	});

	$scope.clickTune = function(tuneName) {
		if(!$scope.obj)
			return;

		if(!$scope.importPatterns[tuneName])
			$scope.importPatterns[tuneName] = { };

		var enable = false;
		for(var patternName in $scope.obj.tunes[tuneName].patterns) {
			if(!$scope.shouldImportPattern(tuneName, patternName)) {
				enable = true;
				break;
			}
		}

		for(var patternName in $scope.obj.tunes[tuneName].patterns) {
			$scope.importPatterns[tuneName][patternName] = enable;
		}
	};

	$scope.patternExists = function(tuneName, patternName) {
		var pattern = state.getPattern(tuneName, patternName);
		if(!state.getPattern(tuneName, patternName))
			return 0;

		return pattern.equals($scope.obj.getPattern(tuneName, patternName)) ? 2 : 1;
	};

	$scope.patternIsUsed = function(tuneName, patternName) {
		for(var i=0; i<$scope.obj.songs.length; i++) {
			if($scope.shouldImportSong(i) && $scope.obj.songs[i].containsPattern(tuneName, patternName))
				return true;
		}
		return false;
	};

	$scope.shouldImportSong = function(songIdx) {
		if($scope.state.songExists($scope.obj.songs[songIdx]))
			return false;
		else if($scope.importSongs[songIdx] != null)
			return $scope.importSongs[songIdx];
		else
			return true;
	};

	$scope.shouldImportPattern = function(tuneName, patternName) {
		var exists = $scope.patternExists(tuneName, patternName);
		if(exists == 2)
			return false;
		else if(!exists && $scope.patternIsUsed(tuneName, patternName))
			return true;
		else if($scope.importPatterns[tuneName] && $scope.importPatterns[tuneName][patternName] != null)
			return $scope.importPatterns[tuneName][patternName];
		else
			return exists != 1;
	};

	$scope.getTuneClass = function(tuneName) {
		var imported = 0;
		for(var patternName in $scope.obj.tunes[tuneName].patterns) {
			if($scope.shouldImportPattern(tuneName, patternName))
				imported++;
		}

		if(imported == 0)
			return "";
		else if(imported == Object.keys($scope.obj.tunes[tuneName].patterns).length)
			return "active";
		else
			return "list-group-item-info";
	};

	$scope.doImport = function() {
		$scope.state.extend($scope.obj, $scope.shouldImportSong.bind($scope), $scope.shouldImportPattern.bind($scope));

		$scope.$close();
	};
});

app.factory("bbImportDialog", function($uibModal, $timeout) {
	var openDialog = null;

	return {
		openDialog: function(state) {
			this.close();

			openDialog = $uibModal.open({
				template: require("./import-dialog.html"),
				controller: "bbImportDialogCtrl",
				size: "lg",
				windowClass: "bb-import-dialog",
				resolve: {
					state: function() { return state; }
				}
			});

			openDialog.rendered.then(function() {
				$timeout(function() {
					$("#bb-import-dialog-paste").focus();
				});
			});

			return openDialog;
		},
		close: function() {
			if(openDialog)
				openDialog.close();
		}
	};
});