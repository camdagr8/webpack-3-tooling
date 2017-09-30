'use strict';

// Modules
const path                 = require('path');
const webpack              = require('webpack');
const fs                   = require('fs-extra');
const UglifyJSPlugin       = require('uglifyjs-webpack-plugin');
const pkg                  = require(__dirname + '/package.json');

// Default configuration
const config = {
    port         : 9000,
    proxyPort    : 9090,
    dest         : 'public',
    src          : 'public/scripts/src',
    entries      : [
        path.resolve(__dirname, 'public/scripts/src'),
        path.resolve(__dirname, 'public/scripts/src/bundles')
    ]
};

module.exports = (env) => {

    config.port = (env.PORT) ? env.PORT : config.port;
    config.proxyPort = Number(config.port) + 90;

    // The Webpack Package
    let packg = {
        devtool    : '',
        entry      : {},
        plugins    : [],
        target     : 'node',
        node       : {
            console         : false,
            global          : true,
            process         : true,
            __filename      : "mock",
            __dirname       : "mock",
            Buffer          : true,
            setImmediate    : true
        },
        output     :  {
            path        : path.resolve(__dirname, config.dest),
            filename    : '[name]'
        },
        module     :  {
            rules  : [
                {
                    test       : /\.js$/,
                    exclude    : /(node_modules|bower_components)/,
                    use        : {
                        loader     : 'babel-loader',
                        options    : {
                            presets    : ['react', 'env'],
                            plugins    : ['transform-runtime']
                        }
                    }
                }
            ]
        }
    };

    // Minify or Source Map
    if (env.NODE_ENV === 'production') {
        packg.plugins.push(new UglifyJSPlugin());
    } else {
        packg.devtool = 'source-map';
    }

    // Local server
    if (env.NODE_ENV === 'local') {
        packg['watch'] = true;
    }

    // Load js entries
    config.entries.forEach((dir) => {
        let files = fs.readdirSync(dir);
        files.forEach((file) => {
            let filePath = path.resolve(dir, file);
            if (fs.statSync(filePath).isDirectory()) { return; }
            packg.entry['scripts/' + file] = filePath;
        });
    });


    // If jQuery is loaded:
    // Inject keywords so that it is defined within the package
    try {
        require.resolve('jquery');
        console.log('> webpack jquery injection\n');
        packg.plugins.push(new webpack.ProvidePlugin({
            'window.jQuery'    : 'jquery',
            'window.jquery'    : 'jquery',
            'window.$'         : 'jquery',
            'jQuery'           : 'jquery',
            'jquery'           : 'jquery',
            '$'                : 'jquery'
        }));

    } catch (e) {  }

    return packg;
};
