var gulp = require("gulp");
var concat = require("gulp-concat");
var bower = require("gulp-bower");
var inject = require("gulp-inject");
var clean = require("gulp-clean");
var es = require("event-stream");
var series = require("stream-series");
var mainBowerFiles = require("main-bower-files");
var filter = require("gulp-filter");
var rename = require("gulp-rename");
var templateCache = require("gulp-angular-templatecache");


var files = [
	"app/app.js",
    "app/shared/**/*",
    "app/components/**/*",
	"assets/**/*"
];

var deps = mainBowerFiles();


gulp.task("default", [ "all" ]);

gulp.task("clean", function() {
	return gulp.src("build").pipe(clean());
});

gulp.task("bower", function() {
	return bower();
});

gulp.task("deps", function() {
	return es.merge(
		gulp.src(deps)
			.pipe(filter("**/*.js"))
			.pipe(concat("dependencies.js")),
		gulp.src(deps)
			.pipe(filter("**/*.css"))
			.pipe(concat("dependencies.css")),
		gulp.src(deps)
			.pipe(filter(function(file) { return file.stat.isFile() && !file.path.match(/\.(js|css|html)$/); }))
	).pipe(gulp.dest("build"));
});

gulp.task("appResources", function() {
	return es.merge(
		es.merge(
			gulp.src(files)
				.pipe(filter("**/*.js")),
			gulp.src("app/**/*.html", { base: process.cwd()+"/" })
				.pipe(templateCache({ module: "ror-simulator" }))
		).pipe(concat("app.js")),
		gulp.src(files)
			.pipe(filter("**/*.css"))
			.pipe(concat("app.css")),
		gulp.src(files, { base: process.cwd()+"/" })
			.pipe(filter(function(file) { return file.stat.isFile() && !file.path.match(/\.(js|css|html)$/); }))
	).pipe(gulp.dest("build"));
});

gulp.task("app", [ "appResources" ], function() {
	// TODO: Doesn't work on first run
	return gulp
		.src("index.html")
		.pipe(inject(gulp.src([ "build/all.js", "build/all.css" ], { read: false }), { ignorePath: "build/", relative: true }))
		.pipe(gulp.dest("build"));
});

gulp.task("all", [ "deps", "app" ], function() {
	return es.merge(
		gulp.src([ "build/dependencies.js", "build/app.js" ])
			.pipe(concat("all.js")),
		gulp.src([ "build/dependencies.css", "build/app.css" ])
			.pipe(concat("all.css"))
	).pipe(gulp.dest("build"));
});

gulp.task("dev", function() {
	return gulp
		.src("index.html")
		.pipe(rename("index_dev.html"))
		.pipe(inject(gulp.src(deps.concat(files), { read: false }), { relative: true }))
		.pipe(gulp.dest(""));
});

gulp.task("watch", [ "dev" ], function() {
	gulp.watch("index.html", [ "dev" ]);
});