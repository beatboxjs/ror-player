import app from "../../app";
import "./share-dialog.scss";

app.controller("bbShareDialogCtrl", function($scope, state, bbUtils, ng, bbDefaultTunes, linkPattern) {
	$scope.state = state;
	$scope.utils = bbUtils;

	$scope.shareSongs = { };
	if(!linkPattern)
		$scope.shareSongs[state.songIdx] = true;

	$scope.sharePatterns = { };
	if(linkPattern) {
		$scope.sharePatterns[linkPattern[0]] = {};
		$scope.sharePatterns[linkPattern[0]][linkPattern[1]] = true;
	}

	$scope.getModifiedPatternNames = function(tuneName) {
		var ret = [ ];
		for(var patternName in $scope.state.tunes[tuneName].patterns) {
			var originalPattern = bbDefaultTunes.getPattern(tuneName, patternName);
			var pattern = $scope.state.getPattern(tuneName, patternName);
			if(!originalPattern || !pattern.equals(originalPattern))
				ret.push(patternName);
		}
		return ret;
	};

	$scope._getCompressedState = function() {
		return $scope.state.compress(
			function(songIdx) {
				return $scope.shareSongs[songIdx];
			},
			$scope.shouldExportPattern.bind($scope)
		);
	};

	$scope.getRawString = function() {
		return JSON.stringify($scope._getCompressedState());
	};

	$scope.getUrl = function() {
		var onlyTune = null;
		var onlyPattern = null;
		for(var tuneName in $scope.sharePatterns) {
			var patternNames = $scope.getModifiedPatternNames(tuneName);
			for(var i=0; i<patternNames.length; i++) {
				var patternName = patternNames[i];

				if($scope.shouldExportPattern(tuneName, patternName)) {
					if(onlyTune == null)
						onlyTune = tuneName;
					else if(onlyTune != tuneName)
						onlyTune = false;

					if(onlyPattern == null)
						onlyPattern = [ tuneName, patternName ];
					else
						onlyPattern = false;
				}
			}
		}

		var url = "#/" + encodeURIComponent(bbUtils.objectToString($scope._getCompressedState()));
		if(onlyPattern)
			url += "/" + encodeURIComponent(onlyPattern[0]) + "/" + encodeURIComponent(onlyPattern[1]);
		else if(onlyTune)
			url += "/" + encodeURIComponent(onlyTune) + "/";

		return bbUtils.makeAbsoluteUrl(url);
	};

	$scope.getTuneClass = function(tuneName) {
		var enabled = 0;
		var patternNames = $scope.getModifiedPatternNames(tuneName);
		patternNames.forEach(function(patternName) {
			if($scope.shouldExportPattern(tuneName, patternName))
				enabled++;
		});
		if(enabled == 0)
			return "";
		else if(enabled == patternNames.length)
			return "active";
		else
			return "list-group-item-info";
	};

	$scope.isUsedInSong = function(tuneName, patternName) {
		return $scope.state.songs.some(function(song, songIdx) { return $scope.shareSongs[songIdx] && song.containsPattern(tuneName, patternName); })
	};

	$scope.shouldExportPattern = function(tuneName, patternName) {
		if($scope.isUsedInSong(tuneName, patternName))
			return 2;
		else
			return $scope.sharePatterns[tuneName] && $scope.sharePatterns[tuneName][patternName] ? 1 : 0;
	};

	$scope.clickTune = function(tuneName) {
		var enable = ($scope.getTuneClass(tuneName) != "active");
		$scope.sharePatterns[tuneName] = { };
		if(enable) {
			for(var i in $scope.state.tunes[tuneName].patterns) {
				$scope.sharePatterns[tuneName][i] = true;
			}
		}
	};

});

app.factory("bbShareDialog", function($uibModal) {
	var openDialog = null;

	return {
		openDialog: function(state, linkPattern) {
			this.close();

			openDialog = $uibModal.open({
				template: require("./share-dialog.html"),
				controller: "bbShareDialogCtrl",
				size: "lg",
				windowClass: "bb-share-dialog",
				resolve: {
					state: function() { return state; },
					linkPattern: function() { return linkPattern; }
				}
			});

			return openDialog;
		},
		close: function() {
			if(openDialog)
				openDialog.close();
		}
	};
});