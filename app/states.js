import app from "./app";

app.config(function($locationProvider, $stateProvider) {
	$locationProvider.hashPrefix(''); // https://stackoverflow.com/a/41273403/242365

	$stateProvider
		.state("root", {
			url: "/",
			onEnter: function($state, bbConfig) {
				$state.go("listen-tune", { tuneName: bbConfig.tuneOfTheYear });
			}
		})


		/* Listen */

		.state("listen-tune", {
			url: "/listen/:tuneName/",
			onEnter: ($stateParams, $state, $rootScope, $uibModalStack) => {
				$rootScope.$broadcast("bbListen", $stateParams.tuneName);

				$uibModalStack.dismissAll();
			}
		})
		.state("listen-pattern", {
			url: "/listen/:tuneName/:patternName",
			onEnter: ($stateParams, $state, $rootScope, $uibModalStack, bbPatternEditorDialog, bbState) => {
				$rootScope.$broadcast("bbListen", $stateParams.tuneName);

				$uibModalStack.dismissAll();

				bbPatternEditorDialog.editPatternBkp(new bbState(), $stateParams.tuneName, $stateParams.patternName, true).result.finally(function() {
					if($state.is("listen-pattern", $stateParams))
						$state.go("listen-tune", { tuneName: $stateParams.tuneName });
				});
			}
		})


		/* Compose */

		.state("compose", {
			url: "/compose/",
			onEnter: ($rootScope, $uibModalStack) => {
				$rootScope.$broadcast("bbCompose");

				$uibModalStack.dismissAll();
			}
		})

		.state("compose-tune", {
			url: "/compose/:tuneName/",
			onEnter: function($stateParams, $state, $rootScope, bbHistory, $uibModalStack) {
				if(!bbHistory.state.tunes[$stateParams.tuneName])
					return $state.go("compose");

				$uibModalStack.dismissAll();

				$rootScope.$broadcast("bbCompose");
				$rootScope.$broadcast("bbPatternList-openTune", $stateParams.tuneName);
			}
		})
		.state("compose-pattern", {
			url: "/compose/:tuneName/:patternName",
			onEnter: function($stateParams, $state, bbPatternEditorDialog, bbHistory, $uibModalStack, $rootScope) {
				if(!bbHistory.state.getPattern($stateParams.tuneName, $stateParams.patternName))
					return $state.go("compose");

				$rootScope.$broadcast("bbCompose");
				$rootScope.$broadcast("bbPatternList-openTune", $stateParams.tuneName);

				$uibModalStack.dismissAll();

				bbPatternEditorDialog.editPatternBkp(bbHistory.state, $stateParams.tuneName, $stateParams.patternName, false).result.finally(function() {
					if($state.is("compose-pattern", $stateParams))
						$state.go("compose");
				});
			}
		})
		.state("compose-importAndTune", {
			url: "/compose/:importData/:tuneName/",
			onEnter: function($stateParams, $state, bbHistory, bbUtils, $uibModalStack, $timeout) {
				$uibModalStack.dismissAll();

				var errs = bbHistory.loadEncodedString($stateParams.importData);

				if(errs.length > 0)
					bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

				$timeout(function() {
					$state.go("compose-tune", { tuneName: $stateParams.tuneName });
				});
			}
		})
		.state("compose-importAndPattern", {
			url: "/compose/:importData/:tuneName/:patternName",
			onEnter: function($stateParams, $state, bbHistory, bbUtils, $uibModalStack, $timeout) {
				$uibModalStack.dismissAll();

				var errs = bbHistory.loadEncodedString($stateParams.importData);

				if(errs.length > 0)
					bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

				$timeout(function() {
					$state.go("compose-pattern", { tuneName: $stateParams.tuneName, patternName: $stateParams.patternName });
				});
			}
		})
		.state("compose-import", {
			url: "/compose/:importData",
			onEnter: function($stateParams, $state, bbHistory, bbUtils, $uibModalStack, $timeout) {
				$uibModalStack.dismissAll();

				var errs = bbHistory.loadEncodedString($stateParams.importData);

				if(errs.length > 0)
					bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

				$timeout(function() {
					$state.go("compose");
				});
			}
		})


		/* Legacy */

		.state("legacy-tune", {
			url: "/:tuneName/",
			onEnter: ($state, $stateParams) => {
				$state.go("listen-tune", $stateParams)
			}

		})
		.state("legacy-pattern", {
			url: "/:tuneName/:patternName",
			onEnter: function($stateParams, $state) {
				$state.go("listen-pattern", $stateParams);
			}
		})
		.state("legacy-importAndTune", {
			url: "/:importData/:tuneName/",
			onEnter: function($stateParams, $state) {
				$state.go("compose-importAndTune", $stateParams);
			}
		})
		.state("legacy-importAndPattern", {
			url: "/:importData/:tuneName/:patternName",
			onEnter: function($stateParams, $state) {
				$state.go("compose-importAndPattern", $stateParams);
			}
		})
		.state("legacy-import", {
			url: "/:importData",
			onEnter: function($stateParams, $state) {
				$state.go("compose-import", $stateParams);
			}
		});
});


app.run(function($state, bbPatternEditorDialog, bbUtils, bbConfig, $rootScope) {
	let lastTune = null;

	bbPatternEditorDialog.editPatternBkp = bbPatternEditorDialog.editPattern;

	bbPatternEditorDialog.editPattern = function(state, tuneName, patternName) {
		let isCompose = $state.current.name.match(/^compose($|-)/);
		$state.go(isCompose ? "compose-pattern" : "listen-pattern", { tuneName: tuneName, patternName: patternName });
	};


	$rootScope.$on("bbPatternList-tuneOpened", function(e, tuneName) {
		lastTune = tuneName;

		if(["", "root", "listen-tune"].includes($state.current.name))
			$state.go("listen-tune", { tuneName: tuneName });
		else if(["compose", "compose-tune"].includes($state.current.name))
			$state.go("compose-tune", { tuneName: tuneName });
	});

	$rootScope.$on("bbPatternList-tuneClosed", function(e, tuneName) {
		lastTune = null;

		if($state.is("compose-tune"))
			$state.go("compose");
	});

	$rootScope.$on("bbOverviewCompose", () => {
		let isCompose = $state.current.name.match(/^compose($|-)/);
		if(!isCompose)
			$state.go("compose");
	});

	$rootScope.$on("bbOverviewListen", (e, tuneName) => {
		let isCompose = $state.current.name.match(/^compose($|-)/);
		if(isCompose) {
			if(lastTune)
				$state.go("listen-tune", { tuneName: lastTune });
			else
				$state.go("root");
		}
	});
});