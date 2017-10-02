'use strict';

// Modules
const path                 = require('path');
const webpack              = require('webpack');
const fs                   = require('fs-extra');
const CopyWebpackPlugin    = require('copy-webpack-plugin');
const UglifyJSPlugin       = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin    = require('extract-text-webpack-plugin');

// Default configuration (if no config passed to module.exports)
const def = {
    port          : 9000,
    dest          : 'dist',
    scriptDest    : 'public/scripts/',
    styleDest     : 'public/styles/',
    env           : {'NODE_ENV' : 'local'},
    app           : [
        path.resolve(__dirname, 'app')
    ],
    scripts       : [
        path.resolve(__dirname, 'public/scripts/src'),
        path.resolve(__dirname, 'public/scripts/src/bundles')
    ],
    sass          : [
        path.resolve(__dirname, 'public/styles/sass')
    ],
    less          : [
        path.resolve(__dirname, 'public/styles/less')
    ],
    copyIgnore    : [
        'node_modules/**/*',
        '.DS_Store',
        '.editorconfig',
        '.env.json',
        '.git/**/*',
        '.gitignore',
        '.idea/**/*',
        'gulpfile.js',
        'LICENSE',
        'package.json',
        'README.md',
        '*.config.js',
        'public/scripts/src/**/*',
        '**/*.scss',
        '**/*.less'
    ]
};

module.exports = (config) => {

    config = config || def;

    let env = config.env;

    if (!env.hasOwnProperty('NODE_ENV')) {
        env.NODE_ENV = 'local';
    }

    // Clear dest dir
    if (env.hasOwnProperty('ClEAR')) {
        fs.emptyDirSync(path.resolve(__dirname, config.dest));
    }

    config['port']         = (env.hasOwnProperty('PORT')) ? env.PORT : config.port;
    config['proxyPort']    = Number(config.port) + 90;

    // The Webpack Package
    let packg = {
        devtool    : '',
        entry      : {},
        plugins    : [],
        target     : 'node',
        stats      : 'errors-only',
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
                    test: /\.(html|ejs)$/,
                    use: [ 'file-loader?name=[path][name].[ext]!extract-loader!html-loader' ]
                },
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
                },
                {
                    test       : /\.css$/,
                    exclude    : /(node_modules|bower_components)/,
                    loader     : ExtractTextPlugin.extract(['css-loader', 'postcss-loader'])
                },
                {
                    test       : /\.less$/i,
                    exclude    : /(node_modules|bower_components)/,
                    loader     : ExtractTextPlugin.extract(['css-loader', 'postcss-loader', 'less-loader'])
                },
                {
                    test       : /\.(sass|scss)$/,
                    exclude    : /(node_modules|bower_components)/,
                    loader     : ExtractTextPlugin.extract(['css-loader', 'postcss-loader', 'sass-loader'])
                }
            ]
        }
    };

    // Style sheets
    packg.plugins.push(new ExtractTextPlugin({
        filename: (getPath) => {
            return getPath('[name].css').replace('.scss', '').replace('.sass', '').replace('.less', '');
        },
        allChunks: true
    }));

    // Minify or Source Map
    if (env.NODE_ENV === 'production') {
        packg.plugins.push(new UglifyJSPlugin());
    } else {
        packg.devtool = 'source-map';
    }

    // Local server
    if (env.hasOwnProperty('WATCH')) {
        packg['watch'] = true;
    }

    // Load script entries
    config.scripts.forEach((dir) => {
        let files = fs.readdirSync(dir);
        files.forEach((file) => {
            let filePath = path.resolve(dir, file);
            if (fs.statSync(filePath).isDirectory()) { return; }
            packg.entry[config.scriptDest + file] = filePath;
        });
    });

    // Load style entries
    config.sass.forEach((dir) => {
        let files = fs.readdirSync(dir);
        files.forEach((file) => {
            let filePath = path.resolve(dir, file);
            if (fs.statSync(filePath).isDirectory()) { return; }
            packg.entry[config.styleDest + file] = filePath;
        });
    });

    // Load app entries
    config.app.forEach((dir) => {
        let files = fs.readdirSync(dir);
        files.forEach((file) => {
            let filePath = path.resolve(dir, file);
            if (fs.statSync(filePath).isDirectory()) { return; }
            packg.entry[config.dest + file] = filePath;
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


    // Add dest dir to ignore list so that
    // it doesn't copy itself into itself
    config.copyIgnore.push(config.dest + '/**/*');

    // Copy files to dest
    packg.plugins.push(new CopyWebpackPlugin(
        [
            {
                from: path.resolve(__dirname),
                to: path.resolve(__dirname, config.dest),
            }
        ],
        {
            ignore: config.copyIgnore
        }
    ));

    return packg;
};
