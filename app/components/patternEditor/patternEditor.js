angular.module("ror-simulator").controller("patternEditorCtrl", function($scope, $modalInstance, Tunes, tuneName, patternName, Player) {

	$scope.tuneName = tuneName;
	$scope.patternName = patternName;

	$scope.tune = $scope.tunes[tuneName];
	$scope.pattern = $scope.tune.patterns[patternName];
	$scope.playingOptions = {
		speed: 100,
		headphones: null,
		muted: { },
		strokeCallback: function(i) {
			if(i%$scope.pattern.time == 0) {
				var beat = $(".beat-"+(i/$scope.pattern.time)); // TODO: Proper selector
				beat.addClass("active");
				setTimeout(function() { beat.removeClass("active"); }, 12000/$scope.playingOptions.speed);
			}
		}
	};

	$scope.getNumber = function(num) {
		return new Array(num);
	};

	$scope.playing = null;

	$scope.playPause = function() {
		if(!$scope.playing)
			$scope.playing = Player.playPattern($scope.pattern, $scope.playingOptions);
		else if($scope.playing.playing)
			$scope.playing.stop();
		else
			$scope.playing.start();
	};

	$scope.stop = function() {
		if($scope.playing) {
			$scope.playing.stop();
			$scope.playing = null;
		}
	};

	$modalInstance.result.then(function() {
		$scope.stop();
	}, function() {
		$scope.stop();
	});

	$scope.getBeatClass = function(i) {
		var ret = [ "beat-"+i ];
		if(i%4 == 3)
			ret.push("before-bar");
		if(i%4 == 0)
			ret.push("bar");
		return ret;
	};

	$scope.getStrokeClass = function(i) {
		var ret = [ "stroke-"+(i%$scope.pattern.time) ];
		if((i+1)%$scope.pattern.time == 0)
			ret.push("before-beat");
		if(i%$scope.pattern.time == 0)
			ret.push("beat");
		if((i+1)%($scope.pattern.time*4) == 0)
			ret.push("before-bar");
		if(i%($scope.pattern.time*4) == 0)
			ret.push("bar");
		return ret;
	};

	$scope.headphones = function(instrumentKey) {
		if($scope.playingOptions.headphones == instrumentKey)
			$scope.playingOptions.headphones = null;
		else
			$scope.playingOptions.headphones = instrumentKey;
	};

	$scope.mute = function(instrumentKey) {
		$scope.playingOptions.mute[instrumentKey] = !$scope.playingOptions.mute[instrumentKey];
	}
});