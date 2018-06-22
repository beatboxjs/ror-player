import app from "../../app";
import "./history.scss";

app.directive("bbHistory", function() {
	return {
		template: require("./history.html"),
		controller: "bbHistoryController",
		scope: { },
		replace: true
	};
});

app.controller("bbHistoryController", function($scope, bbHistory, bbUtils, $) {
	$scope.bbHistory = bbHistory;

	$scope.$watchCollection("bbHistory.getHistoricStates()", function(states) {
		$scope.historicStates = [ ];
		for(var i=0; i<states.length; i++) {
			$scope.historicStates.push({
				key: states[i],
				readableDate: bbUtils.readableDate(states[i], states[i-1], states[i+1]),
				isoDate: bbUtils.isoDate(states[i])
			});
		}
	});

	var ev1 = $scope.$on("bbHistory:loadEncodedString", function() {
		if(bbHistory.getHistoricStates().length > 1) {
			$scope.popoverMessage = "You have opened a shared view. Your previous songs and tunes can be restored here.";
			$(".bb-history").one("click", function() {
				$scope.$apply(function() {
					$scope.popoverMessage = null;
				})
			});
		}
	});

	$scope.$on("$destroy", function() {
		ev1();
	});
});