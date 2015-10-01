var gulp = require('gulp'),
	gulpSass = require('gulp-sass'),
	gulpDebug = require('gulp-debug'),
	gulpConcat = require('gulp-concat'),
	gulpInjectString = require('gulp-inject-string'),
	gulpSourceMaps = require('gulp-sourcemaps'),
	gulpTsLint = require('gulp-tslint'),
	gulpTs = require('gulp-typescript'),
	del = require('del');

var srcDir = "src",
	outDir = "out",
	srcTs = srcDir + "/ts/**/*.ts",
	configTs = 'tsconfig.json',
	srcSass = srcDir + "/sass/styles.scss",
	outCss = outDir,
	srcIndex = srcDir + "/index.html";


gulp.task('ts:lint', function() {
	return gulp.src(srcTs)
		.pipe(gulpTsLint('tslint.json'))
		.pipe(gulpTsLint.report('prose'));
});

gulp.task('ts:compile', function() {
	var tsResult = gulp.src(srcTs)
		.pipe(gulpSourceMaps.init())
		.pipe(gulpTs(configTs));
	return tsResult.js
		.pipe(gulpSourceMaps.write())
		.pipe(gulp.dest(outDir));
});

gulp.task('ts:all', ['ts:lint', 'ts:compile']);
gulp.task('build:ts', ['ts:all']);

gulp.task('watch:ts', function () {
	gulp.watch(srcTs, ['build:ts']);
});

gulp.task('build:sass', function () {
	gulp.src(srcSass)
		.pipe(gulpSass().on('error', gulpSass.logError))
		.pipe(gulp.dest(outCss));
});

gulp.task('watch:sass', function () {
	gulp.watch(srcSass, ['build:sass']);
});

gulp.task('build:html', function () {
	gulp.src(srcIndex)
		.pipe(gulp.dest(outDir));
});

gulp.task('watch:html', function () {
	gulp.watch(srcIndex, ['build:html']);
});

gulp.task('watch:all', ['build:all', 'watch:ts', 'watch:sass', 'watch:html']);
gulp.task('watch', ['watch:all']);

gulp.task('clean', function () {
	del(outDir);
});

gulp.task('build:all', ['clean'], function () {
	gulp.start(['build:ts', 'build:sass', 'build:html']);
});

gulp.task('default', function () {
	var tasks = Object.keys(this.tasks);
	tasks.sort();
	console.log("Available tasks:");
	tasks.forEach(function (task) {
		console.log("  " + task);
	});
});
