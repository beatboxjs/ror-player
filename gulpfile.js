var fs = require("fs");
var gulp = require("gulp");
var gutil = require("gulp-util");
var clean = require("gulp-clean");
var gulpIf = require("gulp-if");
var replace = require("gulp-replace");
var path = require("path");
var combine = require("stream-combiner2").obj;
var stream = require("stream");
var vinyl = require("vinyl");
var zlib = require("zlib");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");
const util = require("util");
const jsonFormat = require("json-format");

function packAudioFiles(fileName) {
	var binaries = {};

	const template = util.promisify(fs.readFile)(`${__dirname}/audioFiles.template.ts`);

	var ret = new stream.Transform({ objectMode: true });
	ret._transform = function(file, encoding, callback) {
		zlib.deflateRaw(file.contents, function(err, deflated) {
			if(err)
				return callback(err);

			binaries[path.basename(file.path)] = Buffer.from(deflated).toString("base64");
			callback(null);
		});
	};
	ret._flush = function(callback) {
		if(Object.keys(binaries).length > 0) {
			fs.readFile(`${__dirname}/audioFiles.template.ts`, "utf8", (err, template) => {
				if(err)
					return callback(err);

				this.push(new vinyl({
					path: fileName,
					contents: Buffer.from(template.replace(/{\s*\/\*\s*SAMPLES\s*\*\/\s*}/gi, jsonFormat(binaries)))
				}));

				callback();
			});
		} else {
			callback();
		}
	};

	return ret;
}

gulp.task("audiosprite", function() {
	return combine(
		gulp.src("assets/**/*.mp3", { base: process.cwd() + "/" }),
		packAudioFiles("audioFiles.ts"),
		gulp.dest("build")
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
