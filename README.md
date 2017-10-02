# Webpack 3.6.0 Tooling

## Quick start

1. Run: `npm install`
2. Run: `npm run serve

## How it Works

[Webpack](https://webpack.js.org) is a module bundler for modern JavaScript applications. When Webpack processes your application, it recursively builds a dependency graph that includes every module your application needs, then packages all of those modules into a small number of bundles - often only one - to be loaded by the browser.

This build script intends to transpile JavaScript files using [Babel](https://babeljs.io/) and [Webpack](https://webpack.js.org) as well as run a local Node server that automatically reloads changes and displays them in browser via [BrowserSync's](https://browsersync.io/) live reload.


## The Build Process
![Process](https://preview.ibb.co/izNYWG/webpack_3_6_0_tooling.png)
_As illustrated above, we use [Gulp](https://gulpjs.com) to initiate the build process._


## Configuration
The build process is highly configurable while being prescriptive.

There are 3 main configuration files:
* package.json
* gulpfile.js
* webpack.config.js


### package.json
Typical `NPM` config file. The only thing of note is that all build packages are saved to the `devDependencies` object while any application/front-end packages are saved to the `dependencies` object.


### gulpfile.js

| Property | Description | Default |
|----------|:------------|:--------|
| ext (`String`) | The file types to watch for changes | `'js jsx json jsx ejs html css less scss png jpg ttf woff woff2 eot svg gif txt md'` |
| port (`Number`) | The port BrowserSync serves from | `9000` |
| watch (`Array`) | The files and/or directories to watch | `['webpack.config.js', 'postcss.config.js','public/**/*','server.js','app/**/*']` |


### webpack.config.json
| Property | Description | Default |
|----------|:------------|:--------|
| dest (`String`) | The distribution directory | `dist` |
| styleDest (`String`) | The path within the distribution directory where to save style sheets | `public/styles` |
| scriptDest (`String`) | The path within the distribution directory where to save front-end JavaScripts | `public/scripts` |
| app (`Array`) | The Node application files | `['~/app']` |
| sass (`Array`) | The path to the source `sass` files | `['~/public/styles/sass']` |
| less (`Array`) | The path to the source `less` files | `['~/public/styles/less']` |
| scripts (`Array`) | The path to the source `js` files | `['~/public/scripts/src', '~/public/scripts/src/bundles']`
| copyIgnore (`Array`) | List of files and/or directories to ignore when copying to the distribution directory | `['public/scripts/src/**/*', 'node_modules/**/*', '.editorconfig', 'package.json', 'gulpfile.js', '*.config.js', '.gitignore', '.idea/**/*', '.DS_Store', '.env.json', '.git/**/*', 'README.md', '**/*.scss', '**/*.less', 'LICENSE']`

## Application Architecture

```
app
 -- models
 -- views
 -- controllers
public
 -- assets
 -- scripts
 -- styles
 -- index.html
dist
 -- app (copy)
 -- public (copy with transpiled scripts and styles)
 -- server.js (copy)
node_modules
gulpfile.js
package.json
postcss.config.js
server.js
webpack.config.js
```
