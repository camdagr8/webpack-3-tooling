'use strict';

module.exports = (env) => ({
    map        : 'inline',
    plugins    : {
        'postcss-cssnext'    : {warnForDuplicates: false},
        'postcss-import'     : {},
        'autoprefixer'       : {},
        'cssnano'            : {}
    }
});
