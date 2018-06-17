import app from "../../../app";
import "./playback-settings.scss";

app.directive("bbPlaybackSettings", () => {
	return {
		template: require("./playback-settings.html"),
		controller: "bbPlaybackSettingsController",
		scope: {
			playbackSettings: "=ngModel",
			defaultSettings: "=default",
			tooltipPlacement: "@"
		}
	};
});

app.controller("bbPlaybackSettingsController", (bbConfig, $scope, bbUtils) => {
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

	$scope.headphones = (instrumentKey) => {
		if($scope.playbackSettings.headphones == instrumentKey)
			$scope.playbackSettings.headphones = null;
		else
			$scope.playbackSettings.headphones = instrumentKey;
	};

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

	$scope.reset = function() {
		$scope.playbackSettings.reset($scope.defaultSettings);
	}
});