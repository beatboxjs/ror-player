import app from "../../app";
import "./overview.scss";

app.directive("bbOverview", ($, bbPlayer) => {
	return {
		template: require("./overview.html"),
		scope: {},
		replace: true,
		link: (scope) => {
			scope.$on("bbListen", (e) => {
				scope.activeTab = 0;
			});
			scope.$on("bbCompose", (e) => {
				scope.activeTab = 1;
			});

			scope.$watch("activeTab", (activeTab) => {
				bbPlayer.stopAll();
				scope.$emit(activeTab == 1 ? "bbOverviewCompose" : "bbOverviewListen");
			});

			scope.togglePatternList = function() {
				$("body").toggleClass("bb-pattern-list-visible");
			};

			scope.$on("bbOverview-closePatternList", () => {
				$("body").removeClass("bb-pattern-list-visible");
			});
		}
	};
});