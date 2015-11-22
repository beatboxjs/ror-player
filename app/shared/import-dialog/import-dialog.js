angular.module("beatbox")
	.controller("bbImportDialogCtrl", function($scope, songs, tunes, bbConfig, bbUtils, ng, bbImportExport, bbState) {
		$scope.songs = songs;
		$scope.tunes = tunes;
		$scope.utils = bbUtils;
		$scope.state = bbState;

		$scope.skipSongs = { };
		$scope.skipPatterns = { };

		$scope.obj = null;
		$scope.error = null;

		$scope.$watch("pasted", function(pasted) {
			$scope.obj = null;
			$scope.error = null;

			if(!pasted)
				return;

			pasted = pasted.trim();

			try {
				var m;
				if(pasted.charAt(0) == "{")
					$scope.obj = bbImportExport.decodeObject(JSON.parse(pasted));
				else if(m = pasted.match(/#\/([-_a-zA-Z0-9]+)/))
					$scope.obj = bbImportExport.decodeString(m[1]);
				else
					$scope.error = "Unrecognised format.";
			} catch(e) {
				$scope.error = "Error decoding pasted data: " + (e.message || e);
			}
		});

		$scope.clickTune = function(tuneName) {
			if(!$scope.obj)
				return;

			if(!$scope.skipPatterns[tuneName])
				$scope.skipPatterns[tuneName] = { };

			var enable = false;
			for(var patternName in $scope.obj.tunes[tuneName].patterns) {
				if($scope.skipPatterns[tuneName][patternName])
					enable = true;
				else if(!enable)
					$scope.skipPatterns[tuneName][patternName] = true;
			}

			if(enable)
				$scope.skipPatterns[tuneName] = { };
		};

		$scope.getTuneClass = function(tuneName) {
			var skipped = 0;
			if($scope.skipPatterns[tuneName]) {
				for(var patternName in $scope.obj.tunes[tuneName].patterns) {
					if($scope.skipPatterns[tuneName][patternName])
						skipped++;
				}
			}

			if(skipped == Object.keys($scope.obj.tunes[tuneName].patterns).length)
				return "";
			else if(skipped == 0)
				return "active";
			else
				return "list-group-item-info";
		};
	})
	.factory("bbImportDialog", function($uibModal, $timeout) {
		var openDialog = null;

		return {
			openDialog: function(tunes, songs) {
				this.close();

				openDialog = $uibModal.open({
					templateUrl: "app/shared/import-dialog/import-dialog.html",
					controller: "bbImportDialogCtrl",
					size: "lg",
					windowClass: "bb-import-dialog-window",
					resolve: {
						tunes: function() { return tunes; },
						songs: function() { return songs; }
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