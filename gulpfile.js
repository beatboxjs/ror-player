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
		if(fileName.match(/\.less$/))
			return;

		var m = fileName.match(/\/bower_components\/([-_a-zA-Z0-9]+)\//);
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


gulp.task("default", function(callback) {
	runSequence("clean", "all", callback);
});

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
			.pipe(concat("dependencies.js"))
			.pipe(uglify())
		, gulp.src(deps)
			.pipe(filter("**/*.css"))
			.pipe(concat("dependencies.css"))
			.pipe(modifyCssUrls({ modify: function(url, filePath) { return url.replace(/^\.\.\//, ""); }}))
			.pipe(minifyCss())
		, getDepStream()
			.pipe(filter(function(file) { return file.stat.isFile() && !file.path.match(/\.(js|css|html)$/); }))
	).pipe(gulp.dest("build"));
});

gulp.task("app", [ "scss" ], function() {
	return es.merge(
		es.merge(
			gulp.src(files)
				.pipe(filter("**/*.js"))
			, gulp.src("app/**/*.html", { base: process.cwd()+"/" })
				.pipe(templateCache({ module: "ror-simulator" }))
		)
			.pipe(concat("app.js"))
			.pipe(ngAnnotate())
			.pipe(uglify())
		, gulp.src(files.concat([ "build/scss.css" ]))
			.pipe(filter("**/*.css"))
			.pipe(concat("app.css"))
			.pipe(minifyCss())
		, gulp.src(files, { base: process.cwd()+"/" })
			.pipe(filter(function(file) { return file.stat.isFile() && !file.path.match(/\.(js|css|html|scss)$/); }))
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
		.pipe(concat("scss.css"))
		.pipe(gulp.dest("build"));
});

gulp.task("dev", [ "scss" ], function() {
	return gulp
		.src("index.html")
		.pipe(rename("index_dev.html"))
		.pipe(inject(gulp.src(deps.concat(files).concat([ "build/scss.css" ]), { read: false }), { relative: true }))
		.pipe(gulp.dest(""));
});

gulp.task("watch", [ "dev" ], function() {
	gulp.watch([ "index.html"].concat(files), [ "dev" ]);
});