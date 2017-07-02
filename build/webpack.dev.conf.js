/**
 * @file 开发环境 webpack 配置文件
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

/* eslint-disable no-console */

const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const SwRegisterWebpackPlugin = require('sw-register-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
    },

    // cheap-module-eval-source-map is faster for development
    devtool: '#cheap-module-eval-source-map',
    plugins: [
        // strip dev-only code in Vue source
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': config.dev.env.NODE_ENV,
            'process.env.VUE_ENV': '"server"'
        }),
        // extract vendor chunks for better caching
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                // a module is extracted into the vendor chunk if...
                return (
                    // it's inside node_modules
                    /node_modules/.test(module.context) &&
                    // and not a CSS file (due to extract-text-webpack-plugin limitation)
                    !/\.css$/.test(module.request)
                )
            }
        }),
        // extract webpack runtime & manifest to avoid vendor chunk hash changing
        // on every build.
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),

        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].css')
        }),

        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // service worker caching
        new SWPrecacheWebpackPlugin(config.swPrecache.build),
        new SwRegisterWebpackPlugin({
            filePath: path.resolve(__dirname, '../src/sw-register.js')
        }),
        new VueSSRClientPlugin(),

        new FriendlyErrorsPlugin()
    ]
});
