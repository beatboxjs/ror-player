angular.module("beatbox")
	.controller("bbShareDialogCtrl", function($scope, songs, currentSongIdx, bbConfig, bbUtils, ng, bbImportExport) {
		$scope.songs = songs;
		$scope.utils = bbUtils;
		$scope.config = bbConfig;

		$scope.shareSongs = { };
		$scope.shareSongs[currentSongIdx] = true;

		$scope.sharePatterns = { };

		$scope.getModifiedPatternNames = function(tuneName) {
			var ret = [ ];
			for(var patternName in bbConfig.tunes[tuneName].patterns) {
				var originalPattern = bbConfig.tunesBkp[tuneName] && bbConfig.tunesBkp[tuneName].patterns[patternName];
				var pattern = bbConfig.tunes[tuneName] && bbConfig.tunes[tuneName].patterns[patternName];
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
			return JSON.stringify(bbImportExport.exportObject($scope._getSelectedSongs(), $scope.sharePatterns));
		};

		$scope.getUrl = function() {
			return bbUtils.makeAbsoluteUrl("#" + encodeURIComponent(bbImportExport.exportString($scope._getSelectedSongs(), $scope.sharePatterns)));
		};

		$scope.getTuneClass = function(tuneName) {
			var enabled = 0;
			for(var patternName in bbConfig.tunes[tuneName].patterns) {
				if($scope.shouldExportPattern(tuneName, patternName))
					enabled++;
			}
			if(enabled == 0)
				return "";
			else if(enabled == Object.keys(bbConfig.tunes[tuneName].patterns).length)
				return "active";
			else
				return "list-group-item-info";
		};

		$scope.shouldExportPattern = function(tuneName, patternName) {
			return bbImportExport._shouldExportPattern($scope.songs, $scope.sharePatterns, tuneName, patternName);
		};

		$scope.clickTune = function(tuneName) {
			var enable = ($scope.getTuneClass(tuneName) != "active");
			$scope.sharePatterns[tuneName] = { };
			if(enable) {
				for(var i in bbConfig.tunes[tuneName].patterns) {
					$scope.sharePatterns[tuneName][i] = true;
				}
			}
		};

	})
	.factory("bbShareDialog", function($uibModal) {
		var openDialog = null;

		return {
			openDialog: function(songs, currentSongIdx) {
				this.close();

				openDialog = $uibModal.open({
					templateUrl: "app/shared/share-dialog/share-dialog.html",
					controller: "bbShareDialogCtrl",
					size: "lg",
					windowClass: "bb-share-dialog-window",
					resolve: {
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