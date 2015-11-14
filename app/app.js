angular.module("beatbox", ["ui.bootstrap", "ui.bootstrap-slider", "ngDraggable", "ui.router", "ngBootbox"])
	.constant("$", jQuery)
	.constant("ng", angular)
	.constant("Beatbox", Beatbox)
	.config(function($stateProvider) {
		$stateProvider
			.state("song", {
				url: "",
				onEnter: function(bbPatternEditorDialog) {
					bbPatternEditorDialog.close();
				}
			})
			.state("pattern", {
				url: "/:tuneName/:patternName",
				onEnter: function($stateParams, $state, bbPatternEditorDialog) {
					bbPatternEditorDialog.editPatternBkp($stateParams.tuneName, $stateParams.patternName).result.finally(function() {
						$state.go("song");
					});
				}
			});
	})
	.run(function($state, bbPatternEditorDialog) {
		bbPatternEditorDialog.editPatternBkp = bbPatternEditorDialog.editPattern;

		bbPatternEditorDialog.editPattern = function(tuneName, patternName) {
			$state.go("pattern", { tuneName: tuneName, patternName: patternName });
		};
	});