const webpack = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const base = require('./webpack.base.conf');
const utils = require('./utils');
const config = require('../config');

const env = process.env.NODE_ENV === 'production'
    ? config.build.env
    : config.dev.env;

module.exports = merge(base, {
    target: 'node',
    entry: './src/entry-server.js',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        alias: {
            hammerjs$: 'vue-touch-ssr/src/hammer-ssr.js'
        }
    },
    // https://webpack.js.org/configuration/externals/#externals
    // https://github.com/liady/webpack-node-externals
    externals: nodeExternals({
        // do not externalize CSS files in case we need to import it from a dep
        whitelist: [/\.(css|vue)$/, /vue-touch-ssr/]
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.VUE_ENV': '"server"',
            'process.env': env
        }),
        // extract css into its own file
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].[contenthash].css')
        }),
        new VueSSRServerPlugin()
    ]
});
