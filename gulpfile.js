'use strict';

const gulp           = require('gulp');
const path           = require('path');
const webpack        = require('webpack');
const fs             = require('fs-extra');
const env            = require('gulp-env');
const gutil          = require("gulp-util");
const config         = require('yargs').argv;
const nodemon        = require('gulp-nodemon');
const runSequence    = require('run-sequence');
const browsersync    = require('browser-sync');
const pkg            = require(__dirname + '/package.json');

config.env           = (config.env) ? config.env : {};

// Set the port
const PORT           = (config.env.hasOwnProperty('PORT')) ? Number(config.env.PORT) : 8000;

config.wp            = null;
config.port          = PORT;
config.uiPort        = PORT + 1;
config.proxyPort     = PORT + 90;
config.dest          = 'dist';


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
        verbose: false,
        watch : config.dest,
        delay: 500,
        env: {port: config.proxyPort},
        script: __dirname + '/' + pkg.main,
        ext: 'js jsx json jsx ejs html css less scss png jpg svg gif txt md'
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
    let paths = [
        'webpack.config.js',
        'postcss.config.js',
        'public/**/*',
        'server.js',
        "app/**/*",
    ];
    gulp.watch(paths, ['webpack']);

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
