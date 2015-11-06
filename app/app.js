angular.module("beatbox", ["ui.bootstrap", "ui.bootstrap-slider", "ngDraggable", "ui.router"])
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
	})
	.factory("bootbox", function($, bbUtils) {
		var ret = { };
		[ "alert", "confirm", "prompt", "dialog" ].forEach(function(it) {
			ret[it] = function() {
				for(var j=0; j<arguments.length; j++) {
					if($.isFunction(arguments[j]))
						arguments[j] = bbUtils.wrapApply(arguments[j]);
					if(arguments[j] != null && arguments[j].callback)
						arguments[j].callback = bbUtils.wrapApply(arguments[j].callback);
				}
				return bootbox[it].apply(bootbox, arguments);
			};
		});
		return ret;
	});