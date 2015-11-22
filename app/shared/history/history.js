angular.module("beatbox")
	.directive("bbHistory", function() {
		var cloneInitialised = false;

		return {
			templateUrl: "app/shared/history/history.html",
			controller: "bbHistoryController",
			scope: { },
			replace: true
		};
	})
	.controller("bbHistoryController", function($scope, bbState) {
		$scope.bbState = bbState;

		$scope.getHistoryKeyTitle = function(key) {
			return new Date(key*1000).toISOString();
		};
	});