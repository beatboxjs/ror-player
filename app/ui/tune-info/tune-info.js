import app from "../../app";
import "./tune-info.scss";

app.directive("bbTuneInfo", (bbUtils) => {
	return {
		template: require("./tune-info.html"),
		scope: {
			state: "=bbState",
			tuneName: "=bbTuneName"
		},
		replace: true,
		link: (scope) => {
			scope.utils = bbUtils;

			scope.$watch("tuneName", (tuneName) => {
				scope.tune = scope.state.tunes[tuneName];
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