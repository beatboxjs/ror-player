import app from "../../app";

app.directive("bbTransclude", function() {
	return {
		link: function(scope, el, attrs, ctrl, $transclude) {
			var inject = scope.$eval(attrs.bbScope);

			$transclude(function(clone, newScope) {
				el.replaceWith(clone);

				for(var i in inject) {
					newScope[i] = inject[i];
				}
			});
		}
	}
});