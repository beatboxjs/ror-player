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
var uglify = require("gulp-uglify");
var ngAnnotate = require("gulp-ng-annotate");
var modifyCssUrls = require("gulp-modify-css-urls");
var path = require("path");
var runSequence = require("run-sequence");
var minifyCss = require("gulp-minify-css");
var sass = require("gulp-sass");
var fs = require("fs");
var async = require("async");
var zip = require("gulp-zip");
var ngConstant = require("gulp-ng-constant");
var multimatch = require("multimatch");
var newer = require("gulp-newer");


var files = [
	"app/app.js",
    "app/shared/**/*",
    "app/components/**/*",
	"assets/**/*"
];

var deps = mainBowerFiles();

function commonPrefix(strs) {
	// http://stackoverflow.com/a/1917041/242365
	var A = strs.slice(0).sort(), word1 = A[0], word2 = A[A.length-1], L = word1.length, i= 0;
    while(i<L && word1.charAt(i)=== word2.charAt(i)) i++;
    return word1.substring(0, i);
}

function getDepStream() {
	var apps = { };
	deps.forEach(function(fileName) {
		var m = fileName.match(/\/bower_components\/([-._a-zA-Z0-9]+)\//);
		if(!apps[m[1]])
			apps[m[1]] = [ ];
		apps[m[1]].push(fileName);
	});

	var src = [ ];
	for(var i in apps) {
		var prefix = (apps[i].length == 1) ? path.dirname(apps[0]) : commonPrefix(apps[i]);
		src.push(gulp.src(apps[i], { base: prefix }));
	}

	return es.merge(src);
}


gulp.task("default", [ "all" ]);

gulp.task("clean", function() {
	return gulp.src("build").pipe(clean());
});

gulp.task("bower", function() {
	return bower();
});

gulp.task("deps", function() {
	return es.merge(
		gulp.src(multimatch(deps, "**/*.js"))
			.pipe(newer("build/dependencies.js"))
			.pipe(concat("dependencies.js"))
			.pipe(uglify())
		, gulp.src(multimatch(deps, "**/*.css"))
			.pipe(newer("build/dependencies.css"))
			.pipe(concat("dependencies.css"))
			.pipe(modifyCssUrls({ modify: function(url, filePath) { return url.replace(/^\.\.\//, ""); }}))
			.pipe(minifyCss())
		, getDepStream()
			.pipe(filter(function(file) { return file.stat.isFile() && !file.path.match(/\.(js|css|html)$/); }))
			.pipe(newer("build"))
	).pipe(gulp.dest("build"));
});

gulp.task("app", [ "scss", "audiosprite", "constants" ], function() {
	return es.merge(
		es.merge(
			gulp.src(files)
				.pipe(filter("**/*.js"))
			, gulp.src("app/**/*.html", { base: process.cwd()+"/" })
				.pipe(templateCache({ module: "beatbox" }))
			, gulp.src("build/constants.js")
		)
			.pipe(concat("app.js"))
			.pipe(ngAnnotate())
			.pipe(uglify())
		, gulp.src(files.concat([ "build/scss.css" ]))
			.pipe(filter("**/*.css"))
			.pipe(concat("app.css"))
			.pipe(minifyCss())
		, gulp.src(files, { base: process.cwd()+"/" })
			.pipe(filter(function(file) { return file.stat.isFile() && !file.path.match(/\.(js|css|html|scss|mp3)$/); }))
	).pipe(gulp.dest("build"));
});

gulp.task("allResources", [ "deps", "app" ], function() {
	return es.merge(
		gulp.src([ "build/dependencies.js", "build/app.js" ])
			.pipe(concat("all.js"))
		, gulp.src([ "build/dependencies.css", "build/app.css" ])
			.pipe(concat("all.css"))
	).pipe(gulp.dest("build"));
});

gulp.task("all", [ "allResources" ], function() {
	return gulp
		.src("index.html")
		.pipe(inject(gulp.src([ "build/all.js", "build/all.css" ], { read: false }), { ignorePath: "build/", relative: true }))
		.pipe(gulp.dest("build"));
});

gulp.task("scss", function() {
	return gulp.src(files)
		.pipe(filter("**/*.scss"))
		.pipe(sass())
		.on("error", function(err) { console.error(err); })
		.pipe(concat("scss.css"))
		.pipe(gulp.dest("build"));
});

gulp.task("audiosprite", function() {
	return gulp.src(files)
		.pipe(newer("build/mp3.zip"))
		.pipe(filter("**/*.mp3"))
		.pipe(zip("mp3.zip"))
		.pipe(gulp.dest("build"));
});

gulp.task("constants", function() {
	return ngConstant({
		name: "beatbox",
		constants: {
			bbBuildConstants: {
				dev: false,
				mp3: "mp3.zip"
			}
		},
		stream: true,
		deps: false
	})
		.pipe(rename("constants.js"))
		.pipe(gulp.dest("build"));
});

gulp.task("constants-dev", function() {
	return ngConstant({
		name: "beatbox",
		constants: {
			bbBuildConstants: {
				dev: true,
				mp3: "build/mp3.zip"
			}
		},
		stream: true,
		deps: false
	})
		.pipe(rename("constants-dev.js"))
		.pipe(gulp.dest("build"));
});

gulp.task("dev", [ "scss", "audiosprite", "constants-dev" ], function() {
	return gulp
		.src("index.html")
		.pipe(rename("index_dev.html"))
		.pipe(inject(gulp.src(deps.concat(files).concat([ "build/scss.css", "build/constants-dev.js" ]), { read: false }), { relative: true }))
		.pipe(gulp.dest(""));
});

gulp.task("watch", [ "dev" ], function() {
	gulp.watch([ "index.html"].concat(files), [ "dev" ]);
});