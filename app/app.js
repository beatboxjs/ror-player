angular.module("beatbox", ["ui.bootstrap", "ui.bootstrap-slider", "ngDraggable", "ui.router"])
	.constant("$", jQuery)
	.constant("ng", angular)
	.constant("Beatbox", Beatbox)
	.config(function($stateProvider) {
		$stateProvider
			.state("song", {
				url: "/",
				onEnter: function($uibModalStack) {
					$uibModalStack.dismissAll();
				}
			})
			.state("tune", {
				url: "/:tuneName/",
				onEnter: function($stateParams, $state, $rootScope, bbHistory) {
					if(!bbHistory.state.tunes[$stateParams.tuneName])
						return $state.go("song");

					$rootScope.$broadcast("bbPatternList-openTune", $stateParams.tuneName);
				}
			})
			.state("pattern", {
				url: "/:tuneName/:patternName",
				onEnter: function($stateParams, $state, bbPatternEditorDialog, bbHistory, $uibModalStack, $rootScope) {
					if(!bbHistory.state.getPattern($stateParams.tuneName, $stateParams.patternName))
						return $state.go("song");

					$rootScope.$broadcast("bbPatternList-openTune", $stateParams.tuneName);

					$uibModalStack.dismissAll();

					bbPatternEditorDialog.editPatternBkp(bbHistory.state, $stateParams.tuneName, $stateParams.patternName).result.finally(function() {
						if($state.is("pattern", $stateParams))
							$state.go("song");
					});
				}
			})
			.state("importAndTune", {
				url: "/:importData/:tuneName/",
				onEnter: function($stateParams, $state, bbHistory, bbUtils, $uibModalStack, $timeout) {
					$uibModalStack.dismissAll();

					var errs = bbHistory.loadEncodedString($stateParams.importData);

					if(errs.length > 0)
						bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

					$timeout(function() {
						$state.go("tune", { tuneName: $stateParams.tuneName });
					});
				}
			})
			.state("importAndPattern", {
				url: "/:importData/:tuneName/:patternName",
				onEnter: function($stateParams, $state, bbHistory, bbUtils, $uibModalStack, $timeout) {
					$uibModalStack.dismissAll();

					var errs = bbHistory.loadEncodedString($stateParams.importData);

					if(errs.length > 0)
						bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

					$timeout(function() {
						$state.go("pattern", { tuneName: $stateParams.tuneName, patternName: $stateParams.patternName });
					});
				}
			})
			.state("import", {
				url: "/:importData",
				onEnter: function($stateParams, $state, bbHistory, bbUtils, $uibModalStack, $timeout) {
					$uibModalStack.dismissAll();

					var errs = bbHistory.loadEncodedString($stateParams.importData);

					if(errs.length > 0)
						bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

					$timeout(function() {
						$state.go("song");
					});
				}
			});
	})
	.config(function($uibTooltipProvider) {
		$uibTooltipProvider.options({ appendToBody: true });
	})
	.run(function($state, bbPatternEditorDialog, bbUtils, bbConfig, $rootScope, $uibModal) {
		bbPatternEditorDialog.editPatternBkp = bbPatternEditorDialog.editPattern;

		bbPatternEditorDialog.editPattern = function(state, tuneName, patternName) {
			// FIXME: state is ignored
			$state.go("pattern", { tuneName: tuneName, patternName: patternName });
		};


		$rootScope.$on("bbPatternList-tuneOpened", function(e, tuneName) {
			if($state.current.name == "" || $state.is("song") || $state.is("tune"))
				$state.go("tune", { tuneName: tuneName });
		});

		$rootScope.$on("bbPatternList-tuneClosed", function(e, tuneName) {
			if($state.is("tune"))
				$state.go("song");
		});


		if(!Howler.usingWebAudio || !("btoa" in window)) {
			var scope = $rootScope.$new();
			scope.appName = bbConfig.appName;
			$uibModal.open({
				templateUrl: "assets/compatibility-error.html",
				scope: scope
			});
		}
		else if(!Howler._codecs.mp3)
			bbUtils.alert("This player uses MP3 files. Your browser doesn't seem to support them.");
	});