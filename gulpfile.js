'use strict';

const gulp           = require('gulp');
const path           = require('path');
const webpack        = require('webpack');
const fs             = require('fs-extra');
const env            = require('gulp-env');
const config         = require('yargs').argv;
const nodemon        = require('gulp-nodemon');
const runSequence    = require('run-sequence');
const browsersync    = require('browser-sync');
const pkg            = require(__dirname + '/package.json');


/**
 * -------------------------------------------------------------------------
 * Configuration
 * -------------------------------------------------------------------------
 */

config.dest       = 'dist';
config.styleDest  = 'public/styles/';
config.scriptDest = 'public/scripts/';
config.env        = (config.env) ? config.env : {};
config.ext        = 'js jsx json jsx ejs html css less scss png jpg ttf woff woff2 eot svg gif txt md';
config.app        = [
    path.resolve(__dirname, 'app')
];
config.sass       = [
    path.resolve(__dirname, 'public/styles/sass')
];
config.less       = [
    path.resolve(__dirname, 'public/styles/less')
];
config.scripts    = [
    path.resolve(__dirname, 'public/scripts/src'),
    path.resolve(__dirname, 'public/scripts/src/bundles')
];
config.copyIgnore = [
    'public/scripts/src/**/*',
    'node_modules/**/*',
    '.editorconfig',
    'package.json',
    'gulpfile.js',
    '*.config.js',
    '.gitignore',
    '.idea/**/*',
    '.DS_Store',
    '.env.json',
    '.git/**/*',
    'README.md',
    '**/*.scss',
    '**/*.less',
    'LICENSE'
];
config.watch    = [
    'webpack.config.js',
    'postcss.config.js',
    'public/**/*',
    'server.js',
    'app/**/*'
];

// Set the port
const PORT           = (config.env.hasOwnProperty('PORT')) ? Number(config.env.PORT) : 8000;

config.port          = PORT;
config.uiPort        = PORT + 1;
config.proxyPort     = PORT + 90;
config.wp            = null;


/**
 * -------------------------------------------------------------------------
 * Know what you're doing if you're editing beyond this point!
 * -------------------------------------------------------------------------
 */


// Clear dist dir
gulp.task('clear', (done) => {
    fs.emptyDirSync(path.resolve(__dirname, config.dest));
    done();
});

// webpack
const webpackConfig = require(__dirname + '/webpack.config')(config);
gulp.task('webpack', (done) => {
    config.wp = webpack(webpackConfig, (err, stats) => {
        const result = stats.toJson();
        if (result.errors.length) {
            result.errors.forEach((error) => {
                console.log(error);
            });
        }
        done();
    });
});

// nodemon -> start server and reload on change
gulp.task('nodemon', (done) => {
    let callbackCalled = false;

    env({
        file: '.env.json',
        vars: {
            PORT: config.port
        }
    });

    nodemon({
        delay      : 500,
        verbose    : false,
        ext        : config.ext,
        watch      : config.dest,
        env        : {port: config.proxyPort},
        script     : __dirname + '/' + pkg.main
    }).on('start', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            done();
        }
    }).on('quit', () => {
        process.exit();
    }).on('restart', function () {
        browsersync.reload();

        setTimeout(() => {
            console.log('\n[00:00:00] Browser Reloaded!\n')
        }, 2000);
    });
});

// browsersync
gulp.task('browsersync', (done) => {

    browsersync({
        notify            : false,
        timestamps        : true,
        reloadDelay       : 250,
        reloadDebounce    : 1000,
        logPrefix         : '00:00:00',
        port              : config.port,
        ui                : {port: config.uiPort},
        proxy             : 'localhost:'+config.proxyPort
    });

    done();
});

gulp.task('watcher', (done) => {
    gulp.watch(config.watch, ['webpack']);
    done();
});

// default task
gulp.task('default', (done) => {
    // run build
    if (config.env.NODE_ENV === 'local') {
        runSequence(['clear'], ['webpack'], ['nodemon'], ['watcher'], () => {
            gulp.start('browsersync');
            done();
        });
    } else {
        runSequence(['clear'], ['webpack'], () => {
            done();
        });
    }
});
