import app from "../../../app";
import "./playback-settings.scss";

app.directive("bbPlaybackSettings", () => {
	return {
		template: require("./playback-settings.html"),
		controller: "bbPlaybackSettingsController",
		scope: {
			playbackSettings: "=ngModel",
			defaultSpeed: "=defaultSpeed",
			tooltipPlacement: "@"
		}
	};
});

app.controller("bbPlaybackSettingsController", (bbConfig, $scope, bbUtils, ng) => {
	$scope.config = bbConfig;
	$scope.utils = bbUtils;

	if(!$scope.playbackSettings)
		$scope.playbackSettings = { };
	if($scope.playbackSettings.volume == null)
		$scope.playbackSettings.volume = 1;
	if(!$scope.playbackSettings.mute)
		$scope.playbackSettings.mute = { };
	if(!$scope.playbackSettings.volumes)
		$scope.playbackSettings.volumes = { };

	for(let instrKey in bbConfig.instruments) {
		if($scope.playbackSettings.volumes[instrKey] == null)
			$scope.playbackSettings.volumes[instrKey] = 1;
	}

	$scope.mute = function(instrumentKey) {
		$scope.playbackSettings.mute[instrumentKey] = !$scope.playbackSettings.mute[instrumentKey];
	};

	$scope.allMuted = function() {
		for(var instrumentKey in bbConfig.instruments) {
			if(!$scope.playbackSettings.mute[instrumentKey])
				return false;
		}
		return true;
	};

	$scope.muteAll = function() {
		var mute = !$scope.allMuted();
		for(var instrumentKey in bbConfig.instruments) {
			$scope.playbackSettings.mute[instrumentKey] = mute;
		}
	};

	$scope.resetSpeed = function() {
		$scope.playbackSettings.speed = $scope.defaultSpeed || 100;
	};

	$scope.setVolumes = function(volumes) {
		Object.assign($scope.playbackSettings.volumes, volumes);
	};

	$scope.areVolumesActive = function(volumes) {
		return ng.equals(volumes, $scope.playbackSettings.volumes);
	};
});