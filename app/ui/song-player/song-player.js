import app from "../../app";
import FileSaver from "file-saver";
import "./song-player.scss";

app.directive("bbSongPlayer", function($) {
	return {
		template: require("./song-player.html"),
		controller: "bbSongPlayerController",
		scope: {
			state: '=bbState'
		},
		transclude: true,
		compile: function() {
			return {
				post: function(scope, el, attrs) {
					$("ng-transclude", el).replaceWith(function() { return $(this).contents(); });
				}
			}
		}
	};
});

app.controller("bbSongPlayerController", function($scope, bbConfig, $uibModal, ng, bbUtils, bbPlayer, $element, $timeout, bbShareDialog, bbImportDialog, $, bbPlaybackSettings) {
	$scope.$watch("state.songs[state.songIdx]", function(song) {
		if(song == null) {
			if($scope.state.songs.length == 0)
				$scope.state.createSong();
			song = $scope.state.songs[$scope.state.songIdx = 0];
		}
		$scope.song = song;
	});

	$scope.config = bbConfig;
	$scope.utils = bbUtils;

	$scope.player = bbPlayer.createBeatbox();

	function updateMarkerPos(scrollFurther, force) {
		var i = $scope.player.getPosition()/bbConfig.playTime;
		var beatIdx = Math.floor(i);

		var beat = $(".beat-i-"+beatIdx, $element);
		$(".beat.active").not(beat).removeClass("active");
		beat.addClass("active");

		if(beat.length > 0)
			bbUtils.scrollToElement($(".song-position-marker", $element).offset({ left: beat.offset().left + (i-beatIdx) * beat.outerWidth() }), scrollFurther, force);
	}

	$scope.player.onbeat = function(idx) { updateMarkerPos(true); };

	function updatePattern() {
		$scope.player.setPattern(bbPlayer.songToBeatbox($scope.state));
		$scope.player.setBeatLength(60000/$scope.state.playbackSettings.speed/bbConfig.playTime);
		$scope.player.setRepeat($scope.state.playbackSettings.loop);
	}

	$scope.$watch("song", updatePattern, true);
	$scope.$watch("state.playbackSettings", updatePattern, true);
	// TODO: Listen for pattern changes

	$scope.playPause = function() {
		if(!$scope.player.playing) {
			$scope.player.play();
			updateMarkerPos(true, true);
		}
		else
			$scope.player.stop();
	};

	$scope.stop = function() {
		bbPlayer.stopAll();
		$scope.player.setPosition(0);
	};

	$scope.headphones = function(...instrumentKeys) {
		for(let instrumentKey of instrumentKeys) {
			let idx = $scope.state.playbackSettings.headphones.indexOf(instrumentKey);
			if(idx == -1)
				$scope.state.playbackSettings.headphones.push(instrumentKey);
			else
				$scope.state.playbackSettings.headphones.splice(idx, 1);
		}
	};

	$scope.headphoneAll = function() {
		if($scope.state.playbackSettings.headphones.length == 0)
			$scope.state.playbackSettings.headphones = Object.keys(bbConfig.instruments);
		else
			$scope.state.playbackSettings.headphones = [ ];
	};

	$scope.isHiddenSurdoHeadphone = function(instrumentKey) {
		let surdos = ["ls", "ms", "hs"];
		return surdos.includes(instrumentKey) && !surdos.some((it) => ($scope.state.playbackSettings.headphones.includes(it)));
	};

	$scope.getLength = function() {
		var length = $scope.song.getEffectiveLength($scope.state);
		if($scope.dragging)
			length++;
		if($scope.currentPatternDrag)
			length = Math.max(length, $scope.currentPatternDrag.toIdx+2);
		length = Math.max(4, length);
		return length;
	};

	$scope.getColSpan = function(instrumentKey, i) {
		var pattern = ($scope.song[i] && $scope.song[i][instrumentKey]);
		if(!pattern)
			return 1;

		pattern = $scope.state.getPattern(pattern);
		if(!pattern)
			return 1;

		var ret = 1;
		while(ret<(pattern.length/4)) {
			if($scope.song[i+ret] && $scope.song[i+ret][instrumentKey])
				break;

			ret++;
		}
		return ret;
	};

	$scope.getRowSpan = function(instrumentKey, i) {
		if(!$scope.song[i] || !$scope.song[i][instrumentKey])
			return 1;

		var instrumentKeys = Object.keys(bbConfig.instruments);
		var idx = instrumentKeys.indexOf(instrumentKey);
		var colspan = $scope.getColSpan(instrumentKey, i);
		var ret = 1;
		for(var j=idx+1; j<instrumentKeys.length; j++) {
			if(ng.equals($scope.song[i][instrumentKey], $scope.song[i][instrumentKeys[j]]) && colspan == $scope.getColSpan(instrumentKeys[j], i))
				ret++;
			else
				break;
		}
		return ret;
	};

	$scope.shouldDisplay = function(instrumentKey, i) {
		var instrumentKeys = Object.keys(bbConfig.instruments);
		var idx = instrumentKeys.indexOf(instrumentKey);
		if (idx > 0 && $scope.getRowSpan(instrumentKeys[idx-1], i) >= 2)
			return false;

		for(var j=i-1; j>=0; j--) {
			if($scope.song[j] && $scope.song[j][instrumentKey])
				return (j + $scope.getColSpan(instrumentKey, j) - 1 < i);
		}

		return true;
	};

	$scope.removePattern = function(instrumentKey, idx) {
		var instrumentKeys = Object.keys(bbConfig.instruments);
		var span = $scope.getRowSpan(instrumentKey, idx);
		var instrIdx = instrumentKeys.indexOf(instrumentKey);
		for(var i=0; i<span; i++) {
			delete $scope.song[idx][instrumentKeys[instrIdx+i]];
		}
		if(Object.keys($scope.song[idx]).length == 0)
			delete $scope.song[idx];
	};

	$scope.toggleInstrument = function(instrumentKey, idx, tuneAndPattern) {
		if(ng.equals($scope.song[idx][instrumentKey], tuneAndPattern))
			delete $scope.song[idx][instrumentKey];
		else
			$scope.song[idx][instrumentKey] = tuneAndPattern;
	};

	$scope.getPreviewPlaybackSettings = function(instrumentKey, idx) {
		var ret = new bbPlaybackSettings(Object.assign({}, $scope.state.playbackSettings, {
			length: $scope.getColSpan(instrumentKey, idx)*4,
			loop: false
		}));

		var instrumentKeys = Object.keys(bbConfig.instruments);
		var instrumentIdx = instrumentKeys.indexOf(instrumentKey);
		var rowSpan = $scope.getRowSpan(instrumentKey, idx);
		for(var i=0; i<instrumentKeys.length; i++) {
			ret.mute[instrumentKeys[i]] = (i < instrumentIdx || i >= instrumentIdx+rowSpan);
		}

		return ret;
	};

	$scope.setPosition = function(idx, $event) {
		var beat = $($event.target).closest(".beat");
		var add = ($event.pageX - beat.offset().left) / beat.outerWidth();
		$scope.player.setPosition(Math.floor((idx+add)*bbConfig.playTime));
		updateMarkerPos(false);
	};

	$scope.equals = ng.equals;

	$scope.onDrag = function(instrumentKey, idx, $event) {
		$timeout(function() {
			$scope.removePattern(instrumentKey, idx);
		});
	};

	$scope.onDrop = function(instrumentKey, idx, data) {
		if(data.bbDragType == "pattern-placeholder")
			$scope.dropPattern(instrumentKey, idx, data);
		else if(data.bbDragType == "resize-pattern")
			$scope.resizePattern(data[0], data[1], instrumentKey, idx);
	};

	$scope.dropPattern = function(instrumentKey, idx, data) {
		if(!$scope.song[idx])
			$scope.song[idx] = { };

		if(instrumentKey)
			$scope.song[idx][instrumentKey] = data;
		else {
			for(var i in bbConfig.instruments) {
				$scope.song[idx][i] = data;
			}
		}
	};

	$scope.resizePattern = function(instrumentKey, idx, toInstrumentKey, toIdx) {
		var tuneAndPattern = $scope.song[idx][instrumentKey];
		$scope.removePattern(instrumentKey, idx);

		var patternLength = Math.ceil($scope.state.getPattern(tuneAndPattern).length/4);
		getAffectedResizePatternRange(instrumentKey, idx, toInstrumentKey, toIdx, patternLength).forEach(function(it) {
			$scope.dropPattern(it[0], it[1], tuneAndPattern);
		});
	};

	function getAffectedResizePatternRange(instrumentKey, idx, toInstrumentKey, toIdx, patternLength) {
		var instrumentKeys = Object.keys(bbConfig.instruments);
		var instrumentIdx = instrumentKeys.indexOf(instrumentKey);
		var toInstrumentIdx = instrumentKeys.indexOf(toInstrumentKey);
		toIdx = Math.max(idx, toIdx);

		var ret = [ ];

		for(var i=idx; i<=toIdx; i += (patternLength || 1)) {
			for(var j=Math.min(instrumentIdx, toInstrumentIdx); j<=Math.max(instrumentIdx, toInstrumentIdx); j++) {
				ret.push([ instrumentKeys[j], i ]);
			}
		}

		return ret;
	}

	$scope.currentPatternDrag = null;

	$scope.dragStart = function(data) {
		if(data.bbDragType == "pattern-placeholder")
			$scope.dragging = true;
	};

	$scope.dragStop = function() {
		$scope.dragging = false;
		$scope.currentPatternDrag = null;
		updateResizeRange();
	};

	$scope.dragEnter = function(instrumentKey, i, data) {
		$scope.currentPatternDrag = { instrumentKey: data[0], idx: data[1], toInstrumentKey: instrumentKey, toIdx: i };
		if(data.bbDragType == "resize-pattern")
			updateResizeRange();
	};

	function updateResizeRange() {
		$(".pattern-resize-range", $element).removeClass("pattern-resize-range");

		var c = $scope.currentPatternDrag;
		if(c) {
			getAffectedResizePatternRange(c.instrumentKey, c.idx, c.toInstrumentKey, c.toIdx).forEach(function(it) {
				$(".song-field-"+it[0]+"-"+it[1], $element).addClass("pattern-resize-range");
			});
		}
	}

	var resizeDragDataCache = {};
	$scope.getResizeDragData = function(instrumentKey, i) {
		resizeDragDataCache[instrumentKey] = resizeDragDataCache[instrumentKey] || {};

		if(!resizeDragDataCache[instrumentKey][i]) {
			resizeDragDataCache[instrumentKey][i] = [ instrumentKey, i ];
			resizeDragDataCache[instrumentKey][i].bbDragType = "resize-pattern";
		}

		return resizeDragDataCache[instrumentKey][i];
	};

	$scope.downloadMP3 = function() {
		$scope.loading = 0;
		$scope.player.exportMP3(function(perc) {
			if(Math.floor(perc*20) != Math.floor($scope.loading/5)) {
				$scope.$apply(function() {
					$scope.loading = perc*100;
				});
			}
		}).then(function(blob) {
			$scope.$apply(function() {
				$scope.loading = null;
			});
			FileSaver.saveAs(blob, $scope.state.getSongName() + ".mp3");
		}).catch(function(err) {
			console.error("Error exporting MP3", err.stack || err);
			bbUtils.alert("Error exporting MP3: " + err.message);
		});
	};

	$scope.downloadWAV = function() {
		$scope.loading = 0;
		$scope.player.exportWAV(function(perc) {
			if(Math.floor(perc*20) != Math.floor($scope.loading/5)) {
				$scope.$apply(function() {
					$scope.loading = perc*100;
				});
			}
		}).then(function(blob) {
			$scope.$apply(function() {
				$scope.loading = null;
			});
			FileSaver.saveAs(blob, $scope.state.getSongName() + ".wav");
		}).catch(function(err) {
			console.error("Error exporting WAV", err.stack || err);
			bbUtils.alert("Error exporting WAV: " + err.message);
		});
	};

	$scope.selectSong = function(songIdx) {
		if($scope.state.songIdx == songIdx)
			return;

		$scope.stop();
		$scope.state.songIdx = songIdx;
	};

	$scope.createSong = function() {
		$scope.stop();

		$scope.state.songIdx = $scope.state.createSong();
	};

	$scope.renameSong = function(songIdx) {
		var song = $scope.state.songs[songIdx];
		bbUtils.prompt("Enter song name", song.name).then(function(songName) {
			song.name = songName;
		});
	};

	$scope.copySong = function(songIdx) {
		var copy = ng.copy($scope.state.songs[songIdx]);
		copy.name = copy.name ? "Copy of " + copy.name : "Copy";
		$scope.state.createSong(copy, songIdx+1);

		if($scope.state.songIdx == songIdx)
			$scope.state.songIdx++;
	};

	$scope.removeSong = function(songIdx) {
		bbUtils.confirm("Do you really want to remove the song "+$scope.state.getSongName(songIdx)+"?").then(function() {
			$scope.state.removeSong(songIdx);
		});
	};

	$scope.clearSong = function() {
		bbUtils.confirm("Do you really want to clear the current song?").then(function() {
			$scope.song.clear();
		});
	};

	$scope.openShareDialog = function() {
		bbShareDialog.openDialog($scope.state);
	};

	$scope.openImportDialog = function() {
		bbImportDialog.openDialog($scope.state);
	};
});