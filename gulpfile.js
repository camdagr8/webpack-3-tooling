'use strict';

const gulp           = require('gulp');
const webpack        = require('webpack');
const env            = require('gulp-env');
const config         = require('yargs').argv;
const nodemon        = require('gulp-nodemon');
const runSequence    = require('run-sequence');
const browsersync    = require('browser-sync');
const pkg            = require(__dirname + '/package.json');

// Set the port
const PORT          = Number(config.env.PORT || 8000);

config.port         = PORT;
config.uiPort       = PORT + 1;
config.proxyPort    = PORT + 90;


// webpack
const webpackConfig = require(__dirname + '/webpack.config')(config);
gulp.task('webpack', (done) => {
    webpack(webpackConfig, (err, stats) => {
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
            PORT: config.proxyPort
        }
    });

    nodemon({
        watch : config.dest,
        env: {port: config.proxyPort},
        script: __dirname + '/' + pkg.main,
        ext: 'js ejs json jsx html css scss'
    }).on('start', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            done();
        }
    }).on('quit', () => {
        process.exit();
    }).on('restart', function () {
        browsersync.reload();
    });
});

// browsersync
gulp.task('browsersync', (done) => {

    browsersync({
        notify            : false,
        timestamps        : true,
        reloadDelay       : 1000,
        reloadDebounce    : 2000,
        logPrefix         : '00:00:00',
        port              : config.port,
        ui                : {port: config.uiPort},
        proxy             : 'localhost:'+config.proxyPort
    });

    done();
});

// default task
gulp.task('default', (done) => {
    // run build
    if (config.env.NODE_ENV === 'local') {
        runSequence(['webpack'], ['nodemon'], () => {
            gulp.start('browsersync');
            done();
        });
    }
});
