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
				onEnter: function($stateParams, $state, bbPatternEditorDialog, bbState) {
					bbPatternEditorDialog.editPatternBkp(bbState.tunes, $stateParams.tuneName, $stateParams.patternName).result.finally(function() {
						$state.go("song");
					});
				}
			})
			.state("importAndPattern", {
				url: ":importData/:tuneName/:patternName",
				onEnter: function($stateParams, $state, bbImportExport) {

				}
			})
			.state("import", {
				url: ":importData",
				onEnter: function($stateParams, $state) {

				}
			});
	})
	.run(function($state, bbPatternEditorDialog) {
		bbPatternEditorDialog.editPatternBkp = bbPatternEditorDialog.editPattern;

		bbPatternEditorDialog.editPattern = function(tunes, tuneName, patternName) {
			// FIXME; tunes is ignored
			$state.go("pattern", { tuneName: tuneName, patternName: patternName });
		};
	});