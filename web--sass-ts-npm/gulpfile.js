// Minimum dependencies to run environment information section
var chalk = require('chalk'),
    gulpUtil = require('gulp-util');

/*
 * Environment variables
 */
// Debug or production mode
if (gulpUtil.env.hasOwnProperty('prod') || gulpUtil.env.hasOwnProperty('production')) {
    process.env.NODE_ENV = 'production';
}
var DEBUG = ['production', 'prod'].indexOf(process.env.NODE_ENV) === -1;
// Should show build notifications?
var NOTIFY = gulpUtil.env.hasOwnProperty('notify');

/*
 * Print information about the current environment
 */
// Print information about the build environment flag
console.log('Running with ' + chalk.yellow('NODE_ENV') + ' flag ' +
    'set to ' + chalk.magenta(DEBUG ? 'dev' : process.env.NODE_ENV) +
    '. Set ' + chalk.yellow('NODE_ENV') + ' environment variable to ' +
    chalk.magenta('production') + ' in order to turn off minification, etc.\n');
// Print information about notification flag
console.log('Notifications are ' + chalk.magenta(NOTIFY ? 'enabled' : 'not enabled') +
    '. Use the flag ' + chalk.yellow('--notify') + ' in order to turn on notifications.\n');


console.log(chalk.green('Loading dependencies'));
/*
* Build dependencies
*/
var gulp = require('gulp'),
    gulpAutoprefixer = require('gulp-autoprefixer'),
    gulpConcat = require('gulp-concat'),
    gulpDebug = require('gulp-debug'),
    gulpReplace = require('gulp-replace'),
    gulpSass = require('gulp-sass'),
    gulpSassDirImport = require('gulp-sass-bulk-import')
    gulpServer = require('gulp-server-livereload'),
    gulpSourceMaps = require('gulp-sourcemaps'),
    gulpTs = require('gulp-typescript'),
    gulpTsLint = require('gulp-tslint'),
    gulpUglify = require('gulp-uglify'),
    browserify = require('browserify'),
    del = require('del'),
    exec = require('child_process').exec,
    fs = require('fs');
    merge = require('merge2'),
    resolve = require('resolve'),
    vinylBuffer = require('vinyl-buffer'),
    vinylSource = require('vinyl-source-stream');
console.log(chalk.green('Dependencies loaded'));

/*
 * Paths to configs, source, output, temp files & folders
 */
var srcDir = 'src',
    outDir = 'out',
    tmpDir = 'tmp',
    srcTs = ['/ts/**/*.ts', '/ts/**/*.tsx'].map(function(m){return srcDir+m}),
    configTs = 'tsconfig.json',
    tmpTs = tmpDir + '/app.js',
    outTs = 'app.js',
    srcJs = srcDir + '/js/**/*.js',
    outJs = 'lib.js'
    srcSass = srcDir + '/sass/**/*.scss',
    outCss = outDir,
    srcIndex = srcDir + '/index.html',
    srcAssets = srcDir + '/assets/**/*.*';
    outAssets = outDir + '/assets/';
    appConfig = './appconfig.json';

/*
 * Helper functions
 */

// Syncronously check if a path exists as a file or directory
function doesLocExist(path) {
    try {
        var stat = fs.lstatSync(path);
        return stat.isFile() || stat.isDirectory();
    } catch (e) {}
    return false;
}

// Syncronously load JSON from a file path
function loadJson(path) {
    if (!doesLocExist(path)) {
        throw new Error('"' + path + '" cannot be loaded because it does not exist');
        return;
    }
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

// Print a proeprly formatted error for brwoserify
function browserifyError(error) {
    return '[' + chalk.cyan('browserify') + '] ' + chalk.red('error') + ' ' +
        (error.toString().indexOf('Error: ') === 0
            ? error.toString().substring(7)
            : error.toString());
}

// Show a notification about a build error
function notify(title) {
    if (NOTIFY) {
        var nodeNotifier = require('node-notifier');
        return function(error) {
            nodeNotifier.notify({
                title: title,
                message: error.message
            });
        }
    } else {
        return function() {};
    }
}

// Get a configuration object from the appconfig.json file
function getAppConfig(section) {
    return loadJson(appConfig)[section];
}

// Get the dependencies from the package.json file
function getPackageDependencyIds() {
    return Object.keys(loadJson('package.json')['dependencies']) || [];
}

// Return a function for replacing KEYS with their VALUES as setup in the
// appconfig.json file under 'environments'
function getConfigMapper() {
    var environment = DEBUG ? "dev" : "production";
    var mappings = getAppConfig('environments')[environment];
    return function (match, key, offset, string) {
        return mappings[key];
    }
}

// The regex for allowing the getConigMapper replacement to occur
var CONFIG_MAPPING_REGEX = /\{\{##(.+?)##\}\}/g;


gulp.task('ts:lint', function () {
    /** Lint the TS source according to the rules defined in tslint.json */
    return gulp.src(srcTs)
        .pipe(gulpTsLint('tslint.json'))
        .pipe(gulpTsLint.report('prose'));
        /* Stream breaks if this is called:
         * .on('error', notify('TypeScript Linting'))
         */
});

gulp.task('ts:compile', ['ts:lint'], function () {
    /** Run ts:lint and then compile the TS source w/ config from tsconfig.js and a sourcemap into tmp/app.js */
    return gulp.src(srcTs)
        .pipe(DEBUG ? gulpSourceMaps.init() : gulpUtil.noop())
            .pipe(gulpTs(configTs))
            .on('error', notify('TypeScript Compilation'))
            .js
            .pipe(gulpReplace(CONFIG_MAPPING_REGEX, getConfigMapper()))
            .pipe(DEBUG ? gulpUtil.noop() : gulpUglify())
        .pipe(DEBUG ? gulpSourceMaps.write() : gulpUtil.noop())
        .pipe(gulp.dest(tmpDir));
});

gulp.task('build:ts', ['ts:compile'], function () {
    /** Run ts:compile and then process imports using browserify */
    var b = browserify(tmpTs, {
        debug: DEBUG
    });
    if (getAppConfig('aliases')) {
        b.transform('aliasify', {
            aliases: getAppConfig('aliases')
        });
    }
    getPackageDependencyIds().forEach(function (id) {
        b.external(id);
    });
    return b
        .bundle()
            .on('error', function (error) {
                console.log(browserifyError(error));
                this.emit('end');
            })
        .pipe(vinylSource(outTs))
        .pipe(vinylBuffer())
        .pipe(DEBUG ? gulpUtil.noop() : gulpUglify())
        .pipe(gulp.dest(outDir));
});

gulp.task('watch:ts', ['build:ts'], function () {
    /** Watch for changes in the TS source and rebuild the app when needed */
    gulp.watch(srcTs, ['build:ts']);
});

gulp.task('build:js', function () {
    /** Concat and minify any JS in src/js/ and/or referenced in libraries.json */
    var b = browserify();
    console.log('Packaging vendor libraries:');
    getPackageDependencyIds().forEach(function (id) {
        var path = resolve.sync(id);
        var endOfPath = 'node_modules' + path.split('node_modules')[1];
        console.log('    ' + chalk.magenta(id) + ' from ' + chalk.green(endOfPath));
        b.require(path, { expose: id });
    });
    return b
        .bundle()
            .on('error', function (error) {
                this.emit('end');
                gulpUtil.log(browserifyError(error));
            })
        .pipe(vinylSource(outJs))
        .pipe(vinylBuffer())
        .pipe(DEBUG ? gulpUtil.noop() : gulpUglify())
        .pipe(gulp.dest(outDir));
});

gulp.task('watch:js', ['build:js'], function() {
    /** Watch for changes in the library JS and rebuild the lib.js bundle when needed */
    gulp.watch([srcJs, appConfig], ['build:js']);
});

gulp.task('build:sass', function () {
    /** Compile the SASS into a single CSS file */
    gulp.src(srcSass)
        .pipe(DEBUG ? gulpSourceMaps.init() : gulpUtil.noop())
        .pipe(gulpSassDirImport())
        .pipe(gulpReplace(CONFIG_MAPPING_REGEX, getConfigMapper()))
        .pipe(gulpSass({
                outputStyle: DEBUG ? 'nested' : 'compressed'
            })
            .on('error', gulpSass.logError))
            .on('error', notify('Sass Compilation'))
        .pipe(gulpAutoprefixer({
            browsers: ['last 2 versions'],
            cascade: DEBUG
        }))
        .pipe(DEBUG ? gulpSourceMaps.write() : gulpUtil.noop())
        .pipe(gulp.dest(outCss));
});

gulp.task('watch:sass', ['build:sass'], function () {
    /** Watch for changes in the SASS and rebuild the styling when needed */
    gulp.watch(srcSass, ['build:sass']);
});

gulp.task('build:assets', function () {
    /** Process the assets in the application */
    gulp.src(srcAssets)
        .pipe(gulp.dest(outAssets));
});

gulp.task('watch:assets', ['build:assets'], function () {
    /** Watch for changes in the assets and rebuild the assets when needed */
    gulp.watch(srcAssets, ['build:assets']);
});

gulp.task('build:html', function () {
    /** Build the HTML aspect of the application */
    gulp.src(srcIndex)
        .pipe(gulpReplace(CONFIG_MAPPING_REGEX, getConfigMapper()))
        .pipe(gulp.dest(outDir));
});

gulp.task('watch:html', ['build:html'], function () {
    /** Watch for changes in the HTML and rebuild the HTML when needed */
    gulp.watch(srcIndex, ['build:html']);
});

gulp.task('clean', function () {
    /** Delete the out/ && tmp/ directory if they exist */
    if (doesLocExist(outDir))
        del(outDir);
    if (doesLocExist(tmpDir))
        del(tmpDir);
});

gulp.task('build:all', ['clean'], function () {
    /** Build the full application */
    gulp.start(['build:ts', 'build:js', 'build:sass', 'build:html', 'build:assets']);
});
gulp.task('build', ['build:all']);
/** Alias for build:all */

gulp.task('watch:all', ['clean'], function () {
    /** Watch and rebuild application for any changes in source */
    gulp.start(['watch:ts', 'watch:sass', 'watch:html', 'watch:js', 'watch:assets']);
});
gulp.task('watch', ['watch:all']);
/** Alias for watch:all */

gulp.task('serve', function () {
    /** Serve the out/ directory and automatically reload the browser when it changes */
    if (!doesLocExist('out')) {
        console.log('\nRun `gulp build` in order to generate files to serve at `out/`\n');
    }
    // Generate a port number between 8000 and 10000 based off of the app name
    var nameSeed = require('./package.json')['name']
        .split('')
        .reduce(function (total, char) {
            return total + char.codePointAt(0);
        }, 0);
    var portNumber = nameSeed % (1e4 - 8e3) + 8e3;
    var portNumberLiveReload = nameSeed % (1e4 - 35e3) + 35e3;
    gulp.src('out')
        .pipe(gulpServer({
            livereload: portNumberLiveReload,
            directoryListing: false,
            open: true,
            port: portNumber
        }));
});
gulp.task('serve:watch', ['watch:all'], function () {
    /** Run watch:all along with serve. */
    gulp.start(['serve']);
});

gulp.task('check', function () {
    /** Check that all the latest dependencies are installed. */
    var exec = require('child_process').exec;
    var cmd = 'npm outdated';

    exec(cmd, function (error, stdout, stderr) {
        var missingModules = stdout.split('\n')
            .filter(function (line) {
                return line.indexOf('MISSING') !== -1;
            })
            .map(function (line) {
                var matches = line.match(/(.+?)\s*MISSING\s*([\d\w\.]+)/);
                if (!matches) console.log(line);
                else return matches[1];
            });
        if (missingModules && missingModules.length > 0) {
            console.log('\n' + chalk.red('WARNING:') + ' you are currently missing'
                + ' dependenc' + (missingModules.length > 1 ? 'ies' : 'y') + ' '
                + missingModules.map(function (m) { return '"' + chalk.magenta(m) + '"' }).join(", ")
                + '. Please run '+ chalk.blue('npm install') + ' to remedy this.');
        } else {
            console.log('\n' + chalk.green('Your environment looks good to go! :)'));
        }
    });
})

gulp.task('default', function () {
    /** List available gulp tasks */
    var gulpFile = fs.readFileSync('gulpfile.js', 'utf-8');
    console.log('');
    console.log(chalk.cyan(chalk.underline('Available tasks:')));
    console.log('');
    var regexTaskName = /^gulp.task\('(.+?)',/,
        regexTaskDesc = /^\/\*\*(.+?)\*\//;
    var tasks = [];
    gulpFile.split("\n").forEach(function (line) {
        var strippedLine = line.trim();
        var nameMatch = regexTaskName.exec(strippedLine);
        if (nameMatch && nameMatch.length === 2) {
            tasks.push({
                name: nameMatch[1],
                desc: null,
                isMain: nameMatch[1].indexOf(':') === -1
            });
            return;
        }
        var descMatch = regexTaskDesc.exec(strippedLine);
        if (descMatch && descMatch.length === 2) {
            tasks[tasks.length - 1].desc = descMatch[1].trim();
        }
    });
    var passStr = function(str) { return str; };
    tasks.sort(function (t1, t2) { return t1.name.localeCompare(t2.name); });
    tasks.forEach(function (task) {
        console.log('  ' +
            (task.isMain ? passStr : chalk.dim)(
                chalk.green(task.name) +
                (task.desc ? passStr : function(str) { return ""; })(
                    ' - ' +
                    chalk.magenta(task.desc)
                )));
    });
    console.log('');
});
