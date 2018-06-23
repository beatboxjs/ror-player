import angular from "angular";
import jQuery from "jquery";
import Beatbox from "beatbox.js";
import { Howler } from "howler";

let app = angular.module("beatbox", ["ui.bootstrap", "ui.bootstrap-slider", "ngDraggable", "ui.router"]);

app.constant("$", jQuery);
app.constant("ng", angular);
app.constant("Beatbox", Beatbox);

app.config(function($uibTooltipProvider, $compileProvider) {
	$uibTooltipProvider.options({ appendToBody: true });

	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
});

app.run(function(bbUtils, bbConfig, $rootScope, $uibModal) {
	if(!Howler.usingWebAudio || !("btoa" in window)) {
		var scope = $rootScope.$new();
		scope.appName = bbConfig.appName;
		$uibModal.open({
			template: require("../assets/compatibility-error.html"),
			scope: scope
		});
	}
	else if(!Howler._codecs.mp3)
		bbUtils.alert("This player uses MP3 files. Your browser doesn't seem to support them.");
});

app.controller("BeatboxController", function($scope, bbUtils, bbConfig) {
	$scope.getAppName = function() {
		return bbConfig.appName;
	};

	$scope.getDownloadFilename = function() {
		return $scope.getAppName().toLowerCase().replace(/[-_ ]+/g, "-") + '.html';
	};
});

export default app;