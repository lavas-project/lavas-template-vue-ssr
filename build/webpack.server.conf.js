/**
 * @file 生产环境 webpack server配置文件
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const base = require('./webpack.base.conf');

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
        whitelist: [/\.(css|vue)$/]
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.VUE_ENV': '"server"',
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new VueSSRServerPlugin()
    ]
});
