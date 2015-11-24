angular.module("beatbox")
	.controller("bbShareDialogCtrl", function($scope, state, bbUtils, ng, bbDefaultTunes) {
		$scope.state = state;
		$scope.utils = bbUtils;

		$scope.shareSongs = { };
		$scope.shareSongs[state.songIdx] = true;

		$scope.sharePatterns = { };

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
			return bbUtils.makeAbsoluteUrl("#/" + encodeURIComponent(bbUtils.objectToString($scope._getCompressedState())));
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
			if($scope.state.songs.some(function(song) { return song.containsPattern(tuneName, patternName); }))
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

	})
	.factory("bbShareDialog", function($uibModal) {
		var openDialog = null;

		return {
			openDialog: function(state) {
				this.close();

				openDialog = $uibModal.open({
					templateUrl: "app/shared/ui/share-dialog/share-dialog.html",
					controller: "bbShareDialogCtrl",
					size: "lg",
					windowClass: "bb-share-dialog",
					resolve: {
						state: function() { return state; }
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