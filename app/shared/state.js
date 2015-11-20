angular.module("beatbox").factory("bbState", function(bbConfig, ng, $, $rootScope, bbUtils) {
	var bbState = {
		songs : localStorage.songs ? JSON.parse(localStorage.songs) : [ ],
		tunes : ng.copy(bbConfig.tunes)
	};

	bbState.tunes[bbConfig.myTunesKey] = localStorage.myTunes ? JSON.parse(localStorage.myTunes) : { patterns: { } };

	$rootScope.$watch(function(){ return bbState.tunes[bbConfig.myTunesKey]; }, function(myTunes) {
		localStorage.myTunes = JSON.stringify(myTunes);

		// Check if all patterns still exist
		for(var i=0; i<bbState.songs.length; i++) {
			for(var j in bbState.songs[i]) {
				if(j == "name")
					continue;

				for(var k in bbState.songs[i][j]) {
					if(!bbUtils.getPattern(bbState.tunes, bbState.songs[i][j][k]))
						delete bbState.songs[i][j][k];
				}
				if(Object.keys(bbState.songs[i][j]).length == 0)
					delete bbState.song[i][j];
			}
		}
	}, true);

	if (localStorage.song) { // Legacy
		bbState.songs.push(JSON.parse(localStorage.song));
		delete localStorage.song;
	}

	$rootScope.$watch(function(){ return bbState.songs; }, function(songs) {
		localStorage.songs = JSON.stringify(songs);
	}, true);

	return bbState;
});