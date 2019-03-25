var fs = require("fs");
var gulp = require("gulp");
var gutil = require("gulp-util");
var clean = require("gulp-clean");
var gulpIf = require("gulp-if");
var newer = require("gulp-newer");
var replace = require("gulp-replace");
var path = require("path");
var combine = require("stream-combiner2").obj;
var stream = require("stream");
var vinyl = require("vinyl");
var zlib = require("zlib");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");

var files = [
	"app/app.js",
    "app/shared/**/*",
    "app/components/**/*",
	"assets/**/*"
];

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
				contents: new Buffer('import app from "../app/app"; app.constant("bbAudioFiles", ' + JSON.stringify(binaries) + ');')
			}));
		}
		callback();
	};

	return ret;
}

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

gulp.task("webpack", gulp.series("audiosprite", async function runWebpack() {
	let stats = await new Promise((resolve, reject) => {
		webpack(webpackConfig).run((err, stats) => { err ? reject(err) : resolve(stats) });
	});

	gutil.log("[webpack]", stats.toString());

	if(stats.compilation.errors && stats.compilation.errors.length > 0)
		throw new gutil.PluginError("webpack", "There were compilation errors.");
}));


gulp.task("all", gulp.series("webpack"));

gulp.task("default", gulp.series("all"));

gulp.task("clean", function() {
	return combine(
		gulp.src("build"),
		clean()
	);
});
