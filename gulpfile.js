var async = require("async");
var es = require("event-stream");
var fs = require("fs");
var gulp = require("gulp");
var templateCache = require("gulp-angular-templatecache");
var clean = require("gulp-clean");
var concat = require("gulp-concat");
var cssBase64 = require("gulp-css-base64");
var gulpIf = require("gulp-if");
var inject = require("gulp-inject");
var minifyCss = require("gulp-minify-css");
var newer = require("gulp-newer");
var ngAnnotate = require("gulp-ng-annotate");
var replace = require("gulp-replace");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify");
var mainBowerFiles = require("main-bower-files");
var path = require("path");
var combine = require("stream-combiner");
var util = require("util");
var stream = require("stream");
var vinyl = require("vinyl");
var zlib = require("zlib");

var files = [
	"app/app.js",
    "app/shared/**/*",
    "app/components/**/*",
	"assets/**/*"
];

var deps = mainBowerFiles();

function packAudioFiles(fileName) {
	var binaries = {};

	var ret = new stream.Transform({ objectMode: true });
	ret._transform = function(file, encoding, callback) {
		zlib.deflateRaw(file.contents, function(err, deflated) {
			if(err)
				return callback(err);

			binaries[path.basename(file.path)] = new Buffer(deflated).toString("base64");
			callback(null);
		});
	};
	ret._flush = function(callback) {
		if(Object.keys(binaries).length > 0) {
			this.push(new vinyl({
				path: fileName,
				contents: new Buffer('angular.module("beatbox").constant("bbAudioFiles", ' + JSON.stringify(binaries) + ');')
			}));
		}
		callback();
	};

	return ret;
}

gulp.task("default", [ "all" ]);

gulp.task("clean", function() {
	return combine(
		gulp.src("build"),
		clean()
	);
});

gulp.task("deps", function() {
	return combine(
		gulp.src(deps, { base: process.cwd() + "/" }),
		gulpIf([ "**/*.js", "**/*.css" ], combine(
			gulpIf("**/*.js", combine(
				newer("build/dependencies.js"),
				gulpIf("!**/bower_components/wav-encoder/**", combine(
					concat("dependencies-without-wav-encoder.js"),
					uglify()
				)),
				concat("dependencies.js")
			)),
			gulpIf("**/*.css", combine(
				newer("build/dependencies.css"),
				gulpIf("**/bower_components/bootstrap/**", combine(
					replace("src: url('../fonts/glyphicons-halflings-regular.eot');", ""),
					replace(/src: url\('\.\.\/fonts\/glyphicons-halflings-regular\..*/g, "src: url('../fonts/glyphicons-halflings-regular.ttf') format('truetype');")
				)),
				cssBase64({ maxWeightResource: 1000000 }),
				concat("dependencies.css"),
				minifyCss()
			)),
			gulp.dest("build")
		))
	);
});

gulp.task("app", [ "scss", "audiosprite" ], function() {
	return combine(
		es.merge(
			gulp.src(files, { base: process.cwd() + "/" }),
			gulp.src([ "build/scss.css", "build/audioFiles.js" ])
		),
		gulpIf("**/*.html", templateCache({ module: "beatbox" })),
		gulpIf("**/*.js", combine(
			newer("build/app.js"),
			concat("app.js"),
			ngAnnotate(),
			uglify()
		)),
		gulpIf("**/*.css", combine(
			newer("build/app.css"),
			concat("app.css"),
			minifyCss()
		)),
		gulp.dest("build")
	);
});

gulp.task("all", [ "deps", "app" ], function(callback) {
	async.series([
		function(next) {
			combine(
				es.merge(
					combine(
						gulp.src([ "build/dependencies.js", "build/app.js" ]),
						concat("all.js")
					),
					combine(
						gulp.src([ "build/dependencies.css", "build/app.css" ]),
						concat("all.css")
					)
				),
				gulp.dest("build"),
				es.wait(next)
			);
		}, function(next) {
			combine(
				gulp.src("index.html"),
				replace("<!-- inject:css -->", "<style>" + fs.readFileSync("build/all.css") + "</style>"),
				replace("<!-- inject:js -->", "<script>" + fs.readFileSync("build/all.js") + "</script>"),
				replace("<!-- endinject -->", ""),
				gulp.dest("build"),
				es.wait(next)
			);
		}
	], callback);
});

gulp.task("scss", function() {
	return combine(
		gulp.src(files),
		gulpIf("**/*.scss", combine(
			newer("build/scss.css"),
			sass(),
			concat("scss.css"),
			gulp.dest("build")
		))
	);
});

gulp.task("audiosprite", function() {
	return combine(
		gulp.src(files, { base: process.cwd() + "/" }),
		gulpIf("**/*.mp3", combine(
			newer("build/audioFiles.js"),
			packAudioFiles("audioFiles.js"),
			gulp.dest("build")
		))
	);
});

gulp.task("dev", [ "scss", "audiosprite" ], function() {
	return combine(
		gulp.src("index.html"),
		replace("<head>", "<head><base href=\"..\">"),
		inject(gulp.src(deps.concat(files).concat([ "build/scss.css", "build/audioFiles.js" ]), { read: false }), { relative: true }),
		gulp.dest("build")
	);
});

gulp.task("watch", [ "dev" ], function() {
	gulp.watch([ "index.html" ].concat(files), [ "dev" ]);
});