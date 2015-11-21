angular.module("beatbox")
	.controller("bbShareDialogCtrl", function($scope, songs, tunes, currentSongIdx, bbConfig, bbUtils, ng, bbImportExport, bbState) {
		$scope.songs = songs;
		$scope.tunes = tunes;
		$scope.utils = bbUtils;
		$scope.state = bbState;

		$scope.shareSongs = { };
		$scope.shareSongs[currentSongIdx] = true;

		$scope.sharePatterns = { };

		$scope.getModifiedPatternNames = function(tuneName) {
			var ret = [ ];
			for(var patternName in bbState.tunes[tuneName].patterns) {
				var originalPattern = bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName].patterns[patternName];
				var pattern = bbState.tunes[tuneName] && bbState.tunes[tuneName].patterns[patternName];
				if(!originalPattern || !ng.equals(pattern, originalPattern))
					ret.push(patternName);
			}
			return ret;
		};

		$scope._getSelectedSongs = function() {
			return $scope.songs.filter(function(song, songIdx) {
				return $scope.shareSongs[songIdx];
			});
		};

		$scope.getRawString = function() {
			return JSON.stringify(bbImportExport.exportObject($scope._getSelectedSongs(), $scope.tunes, $scope.sharePatterns));
		};

		$scope.getUrl = function() {
			return bbUtils.makeAbsoluteUrl("#/" + encodeURIComponent(bbImportExport.exportString($scope._getSelectedSongs(), $scope.tunes, $scope.sharePatterns)));
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

		$scope.shouldExportPattern = function(tuneName, patternName) {
			return bbImportExport._shouldExportPattern($scope._getSelectedSongs(), $scope.sharePatterns, tuneName, patternName);
		};

		$scope.clickTune = function(tuneName) {
			var enable = ($scope.getTuneClass(tuneName) != "active");
			$scope.sharePatterns[tuneName] = { };
			if(enable) {
				for(var i in bbState.tunes[tuneName].patterns) {
					$scope.sharePatterns[tuneName][i] = true;
				}
			}
		};

	})
	.factory("bbShareDialog", function($uibModal) {
		var openDialog = null;

		return {
			openDialog: function(tunes, songs, currentSongIdx) {
				this.close();

				openDialog = $uibModal.open({
					templateUrl: "app/shared/share-dialog/share-dialog.html",
					controller: "bbShareDialogCtrl",
					size: "lg",
					windowClass: "bb-share-dialog-window",
					resolve: {
						tunes: function() { return tunes; },
						songs: function() { return songs; },
						currentSongIdx: function() { return currentSongIdx; }
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