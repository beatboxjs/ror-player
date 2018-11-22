import app from "../../app";
import "./tune-info.scss";

app.directive("bbTuneInfo", (bbUtils, bbConfig) => {
	return {
		template: require("./tune-info.html"),
		scope: {
			state: "=bbState",
			tuneName: "=bbTuneName"
		},
		replace: true,
		link: (scope) => {
			scope.utils = bbUtils;

			scope.$watch("tuneName", (tuneName, previousTuneName) => {
				scope.tune = scope.state.tunes[tuneName];

				if(scope.tune) {
					let previousDefaultSpeed = previousTuneName && scope.state.tunes[previousTuneName].speed || bbConfig.defaultSpeed;
					if(scope.state.playbackSettings.speed == previousDefaultSpeed)
						scope.state.playbackSettings.speed = scope.tune.speed || bbConfig.defaultSpeed;
				}
			});
		}
	};
});

app.filter("bbTuneInfoTuneDescription", (bbDefaultTunes, $, $sce) => {
	return (tuneName) => {
		if(!bbDefaultTunes[tuneName])
			return null;

		// Use HTML from default tunes to avoid script injection through bbHistory
		let el = $("<div/>").html(bbDefaultTunes[tuneName].description);
		el.find("a").attr("target", "_blank");
		return $sce.trustAsHtml(el.html());
	};
});