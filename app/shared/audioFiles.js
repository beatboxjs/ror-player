angular.module("beatbox").factory("bbAudioFiles", function(bbBuildConstants) {

	var status = 0;
	var error = null;
	var files = { };

	var callbacks = [ ];

	function load() {
		status = 1;

		JSZipUtils.getBinaryContent(bbBuildConstants.mp3, function(err, data) {
			error = err;

			if(!err) {
				var zip = new JSZip();
				zip.load(data);

				zip.file(/./).forEach(function(file) {
					var m = file.name.match(/\/([^\/]+)$/);
					files[m ? m[1] : file.name] = "data:audio/mp3;base64," + btoa(file.asBinary());
				});
			}

			status = 2;
			while(callbacks.length > 0)
				callbacks.shift()(error, files);
		});
	}

	return {
		getFiles: function(callback) {
			if(status == 0)
				load();
			if(status == 0 || status == 1)
				callbacks.push(callback);
			else
				callback(error, files);
		}
	};

});