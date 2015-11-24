angular.module("beatbox")
	.directive("bbHistory", function() {
		return {
			templateUrl: "app/shared/ui/history/history.html",
			controller: "bbHistoryController",
			scope: { },
			replace: true
		};
	})
	.controller("bbHistoryController", function($scope, bbHistory, bbUtils) {
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
	});