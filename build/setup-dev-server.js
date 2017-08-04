/**
 * @file 调试 server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const MFS = require('memory-fs');
const clientConfig = require('./webpack.client.conf');
const serverConfig = require('./webpack.server.conf');

const readFile = (fs, file) => {
    try {
        return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
    }
    catch (e) {}
};

module.exports = function setupDevServer(app, cb) {
    let bundle;
    let clientManifest;
    let resolve;
    let readyPromise = new Promise(r => (resolve = r));
    let ready = (...args) => {
        resolve();
        cb(...args);
    };

    // modify client config to work with hot middleware
    clientConfig.entry.app = ['webpack-hot-middleware/client', ...clientConfig.entry.app];
    clientConfig.output.filename = '[name].js';
    clientConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    );

    // dev middleware
    let clientCompiler = webpack(clientConfig);
    let devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        noInfo: true
    });

    app.use(devMiddleware);
    clientCompiler.plugin('done', stats => {
        stats = stats.toJson();
        stats.errors.forEach(err => console.error(err));
        stats.warnings.forEach(err => console.warn(err));

        if (stats.errors.length) {
            return;
        }

        clientManifest = JSON.parse(readFile(
            devMiddleware.fileSystem,
            'vue-ssr-client-manifest.json'
        ));

        if (bundle) {
            ready(bundle, {
                clientManifest
            });
        }
    });

    // hot middleware
    app.use(require('webpack-hot-middleware')(clientCompiler, {heartbeat: 5000}));

    // watch and update server renderer
    const serverCompiler = webpack(serverConfig);
    const mfs = new MFS();
    serverCompiler.outputFileSystem = mfs;
    serverCompiler.watch({}, (err, stats) => {
        if (err) {
            throw err;
        }
        stats = stats.toJson();
        if (stats.errors.length) {

            // print all errors
            for (let error of stats.errors) {
                console.error(error);
            }

            return;
        }

        // read bundle generated by vue-ssr-webpack-plugin
        bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'));
        if (clientManifest) {
            ready(bundle, {
                clientManifest
            });
        }
    });

    return readyPromise;
};
