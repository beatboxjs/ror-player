import app from "../../app";

const DEFAULT_FILTER = { text: "", cat: "standard" };

app.directive("bbPatternListFilter", function(bbConfig) {
	return {
		template: require("./pattern-list-filter.html"),
		scope: {
			filter: "=ngModel"
		},
		link: (scope) => {
			scope.filterCats = bbConfig.filterCats;
			scope.filter = scope.filter || Object.assign({}, DEFAULT_FILTER);
		}
	};
});

app.filter("bbPatternListFilter", function() {
	return function(state, params) {
		params = params || DEFAULT_FILTER;

		var ret = [ ];
		var tuneNames = state.getSortedTuneList();
		var text = params && params.text.trim().toLowerCase() || "";
		for(var i=0; i<tuneNames.length; i++) {
			if(text ? (tuneNames[i].toLowerCase().indexOf(text) != -1) : state.tunes[tuneNames[i]].isInCategory(params.cat))
				ret.push(tuneNames[i]);
		}
		return ret;
	};
});