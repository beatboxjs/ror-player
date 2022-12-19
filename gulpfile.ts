/// <reference types="./build-shims" />
/// <reference types="./src/json-format" />
import { promises as fs } from "fs";
import gulp from "gulp";
import gutil from "gulp-util";
import path from "path";
import { obj as combine } from "stream-combiner2";
import stream from "stream";
import vinyl from "vinyl";
import zlib from "zlib";
import webpack, { Stats } from "webpack";
import jsonFormat from "json-format";
import webpackConfig from "./webpack.config.js";

function packAudioFiles(fileName: string) {
	var binaries: Record<string, string> = {};

	var ret = new stream.Transform({ objectMode: true });
	ret._transform = function(file, encoding, callback) {
		zlib.deflateRaw(file.contents, function(err, deflated) {
			if(err)
				return callback(err);

			binaries[path.basename(file.path)] = Buffer.from(deflated).toString("base64");
			callback(null);
		});
	};
	ret._flush = async function(callback) {
		try {
			if(Object.keys(binaries).length > 0) {
				const template = await fs.readFile(new URL('./audioFiles.template.ts', import.meta.url), "utf8");
				this.push(new vinyl({
					path: fileName,
					contents: Buffer.from(template.replace(/{\s*\/\*\s*SAMPLES\s*\*\/\s*}/gi, jsonFormat(binaries)))
				}));
			}
			callback();
		} catch (err: any) {
			callback(err);
		}
	};

	return ret;
}

gulp.task("audiosprite", function() {
	return combine(
		gulp.src("assets/**/*.mp3", { base: process.cwd() + "/" }),
		packAudioFiles("audioFiles.ts"),
		gulp.dest("dist")
	);
});

gulp.task("webpack", gulp.series("audiosprite", async function runWebpack() {
	const config = await webpackConfig({}, {})
	let stats = await new Promise<Stats>((resolve, reject) => {
		webpack(config).run((err, stats) => { err ? reject(err) : resolve(stats!) });
	});

	gutil.log("[webpack]", stats.toString());

	if(stats.compilation.errors && stats.compilation.errors.length > 0)
		throw new gutil.PluginError("webpack", "There were compilation errors.");
}));


gulp.task("all", gulp.series("webpack"));

gulp.task("default", gulp.series("all"));
