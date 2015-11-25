angular.module("beatbox", ["ui.bootstrap", "ui.bootstrap-slider", "ngDraggable", "ui.router"])
	.constant("$", jQuery)
	.constant("ng", angular)
	.constant("Beatbox", Beatbox)
	.config(function($stateProvider) {
		$stateProvider
			.state("song", {
				url: "/",
				onEnter: function(bbPatternEditorDialog) {
					bbPatternEditorDialog.close();
				}
			})
			.state("pattern", {
				url: "/:tuneName/:patternName",
				onEnter: function($stateParams, $state, bbPatternEditorDialog, bbHistory) {
					bbPatternEditorDialog.editPatternBkp(bbHistory.state, $stateParams.tuneName, $stateParams.patternName).result.finally(function() {
						$state.go("song");
					});
				}
			})
			.state("importAndPattern", {
				url: "/:importData/:tuneName/:patternName",
				onEnter: function($stateParams, $state, bbHistory, bbUtils) {
					var errs = bbHistory.loadEncodedString($stateParams.importData);

					if(errs.length > 0)
						bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

					$state.go("pattern", { tuneName: $stateParams.tuneName, patternName: $stateParams.patternName });
				}
			})
			.state("import", {
				url: "/:importData",
				onEnter: function($stateParams, $state, bbHistory, bbUtils) {
					var errs = bbHistory.loadEncodedString($stateParams.importData);

					if(errs.length > 0)
						bbUtils.alert("Errors while loading data:\n" + errs.join("\n"));

					$state.go("song");
				}
			});
	})
	.config(function($uibTooltipProvider) {
		$uibTooltipProvider.options({ appendToBody: true });
	})
	.run(function($state, bbPatternEditorDialog, bbUtils) {
		bbPatternEditorDialog.editPatternBkp = bbPatternEditorDialog.editPattern;

		bbPatternEditorDialog.editPattern = function(state, tuneName, patternName) {
			// FIXME: state is ignored
			$state.go("pattern", { tuneName: tuneName, patternName: patternName });
		};


		if(!Howler._codecs.mp3)
			bbUtils.alert("This player uses MP3 files. Your browser doesn't seem to support them.");
	});