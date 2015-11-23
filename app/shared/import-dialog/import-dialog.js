angular.module("beatbox")
	.controller("bbImportDialogCtrl", function($scope, songs, tunes, bbConfig, bbUtils, ng, bbImportExport, bbHistory, bbPatternEncoder) {
		$scope.songs = songs;
		$scope.tunes = tunes;
		$scope.utils = bbUtils;
		$scope.state = bbHistory;

		$scope.importSongs = { };
		$scope.importPatterns = { };

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

		$scope.songExists = function(song) {
			for(var i=0; i<bbHistory.songs.length; i++) {
				if(bbUtils.songEquals(song, bbHistory.songs[i], true))
					return true;
			}
			return false;
		};

		$scope.patternExists = function(tuneName, patternName) {
			if(!bbHistory.tunes[tuneName] || !bbHistory.tunes[tuneName].patterns[patternName])
				return 0;

			var obj1 = bbPatternEncoder.getEncodedPatternObject($scope.obj.tunes[tuneName].patterns[patternName]);
			var obj2 = bbPatternEncoder.getEncodedPatternObject(bbHistory.tunes[tuneName].patterns[patternName]);
			return ng.equals(obj1, obj2) ? 2 : 1;
		};

		$scope.patternIsUsed = function(tuneName, patternName) {
			for(var i=0; i<$scope.obj.songs.length; i++) {
				if($scope.shouldImportSong(i) && bbUtils.songContainsPattern($scope.obj.songs[i], tuneName, patternName))
					return true;
			}
			return false;
		};

		$scope.shouldImportSong = function(songIdx) {
			if($scope.songExists($scope.obj.songs[songIdx]))
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
			for(var tuneName in $scope.obj.tunes) {
				for(var patternName in $scope.obj.tunes[tuneName].patterns) {
					if(!$scope.shouldImportPattern(tuneName, patternName))
						continue;

					if(!bbHistory.tunes[tuneName])
						bbHistory.tunes[tuneName] = { patterns: { } };

					bbHistory.tunes[tuneName].patterns[patternName] = $scope.obj.tunes[tuneName].patterns[patternName];
				}
			}

			for(var i=0; i<$scope.obj.songs.length; i++) {
				if(!$scope.shouldImportSong(i))
					continue;

				bbHistory.songs.push($scope.obj.songs[i]);
			}

			$scope.$close();
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
					windowClass: "bb-import-dialog",
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