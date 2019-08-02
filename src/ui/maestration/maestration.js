import app from "../../app";

app.directive("bbMaestration", function() {
	return {
		template: require("./maestration"),
		controller: "bbMaestrationController",
		scope: {
			state: "=bbState"
		},
		transclude: true
	};
});

app.controller("bbMaestrationController", function($scope, bbMaestrator, bbConfig, bbUtils, bbPlayer) {
	$scope.signs = bbMaestrator.signs;
	$scope.utils = bbUtils;

	$scope.player = bbPlayer.createBeatbox();

	$scope.forget = function() {
		$scope.currentInstrument = "Everyone";
		$scope.currentSigns = {"Everyone": []};
	};
	$scope.forget();

	$scope.addInstrumentSign = function(instr) {
		$scope.currentInstrument = instr;
		$scope.currentSigns[instr] = [ ];
	};

	$scope.instrumentIsFinished = function() {
		var signs = $scope.currentSigns[$scope.currentInstrument];
		for(var i=0; i<signs.length; i++) {
			if(bbMaestrator.finishingSigns.includes(signs[i]))
				return true;

			if(Array.isArray(signs[i]) && $scope.state.getPattern(signs[i]).loop)
				return true;
		}
		return false;
	};

	$scope.addSign = function(sign) {
		$scope.currentSigns[$scope.currentInstrument].push(sign);
	};

	$scope.addPatternSign = function(tuneName, patternName) {
		$scope.addSign([tuneName, patternName]);
	};

	$scope.setCurrentTune = function(tune) {
		$scope.currentTune = tune;
	};

	$scope.whistleIn = function() {

	};

	$scope.stop = function() {

	};

	function makePattern() {
		var signs = {
			ls: $scope.currentSigns['Low Surdo'] || $scope.currentSigns['Surdos'] || $scope.currentSigns['Everyone'],
			ms: $scope.currentSigns['Mid Surdo'] || $scope.currentSigns['Surdos'] || $scope.currentSigns['Everyone'],
			hs: $scope.currentSigns['High Surdo'] || $scope.currentSigns['Surdos'] || $scope.currentSigns['Everyone'],
			re: $scope.currentSigns['Repi'] || $scope.currentSigns['Everyone'],
			sn: $scope.currentSigns['Snare'] || $scope.currentSigns['Everyone'],
			ta: $scope.currentSigns['Tamborim'] || $scope.currentSigns['Everyone'],
			ag: $scope.currentSigns['Agogo'] || $scope.currentSigns['Everyone'],
			sh: $scope.currentSigns['Shaker'] || $scope.currentSigns['Everyone']
		};

		var song = {};
		var loopSong = {};
		var idx = {};

		for(var instr in signs) {
			idx[instr] = 0;
			for(var i=0; i<signs[instr].length; i++) {
				switch(signs[instr][i]) {
					case "Again":
						// TODO
						break;

					case "Stop playing":
						// TODO
						break;

					default:
						var pattern = $scope.state.getPattern(signs[instr][i]);
						//if(pattern.loop)
						//	loopSong =
				}
			}
		}
	}

	function updatePlayer() {

	}
});

app.factory("bbMaestrator", function() {
	return {
		signs: {
			instruments: [ "Everyone", "Surdos", "Low Surdo", "Mid Surdo", "High Surdo", "Repi", "Snare", "Tamborim", "Agogo", "Shaker" ],
			instructions: [ "Again", "Stop playing", "Continue playing", "Continue one line", "Continue two lines", "Continue three lines", "Continue four lines" ],
			modifiers: [ "In a loop", "Everything in a loop", "4 times from soft to loud", "Everything 4 times from soft to loud" ]
		},
		finishingSigns: ["Again", "Stop playing", "Everything in a loop"]
	};
});