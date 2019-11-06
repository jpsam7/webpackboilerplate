// webpack.dev.js - developmental builds
const LEGACY_CONFIG = 'legacy';
const MODERN_CONFIG = 'modern';

// node modules
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

// webpack plugins
const DashboardPlugin = require('webpack-dashboard/plugin');

// config files
const common = require('./webpack.common.js');
const pkg = require('./package.json');
const settings = require('./webpack.settings.js');

// Configure the webpack-dev-server
const configureDevServer = (buildType) => {
    return {
        public: settings.devServerConfig.public(),
        contentBase: path.resolve(__dirname, settings.paths.templates),
        host: settings.devServerConfig.host(),
        port: settings.devServerConfig.port(),
        https: !!parseInt(settings.devServerConfig.https()),
        disableHostCheck: true,
        hot: true,
        // hotOnly: true,
        // http2: true,
        overlay: true,
        watchContentBase: true,
        compress: true,
        watchOptions: {
            poll: !!parseInt(settings.devServerConfig.poll()),
            ignored: /node_modules/,
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };
};

// Configure Image loader
const configureImageLoader = (buildType) => {
    if (buildType === LEGACY_CONFIG || buildType === MODERN_CONFIG) {
        return {
            test: /\.(png|jpe?g|gif|svg|webp)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name].[hash].[ext]'
                    }
                }
            ]
        };
    }
};

// Configure the scss loader
const configureScssLoader = (buildType) => {
    // Don't generate CSS for the legacy config in development
    if (buildType === LEGACY_CONFIG) {
        return {
            test: /\.(scss|css)$/,
            loader: 'ignore-loader'
        };
    }
    if (buildType === MODERN_CONFIG) {
        return {
            test: /\.(scss|css)$/,
            use: [
                {
                    loader: 'style-loader',
                },
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 2,
                        sourceMap: true
                    }
                },
                {
                    loader: 'resolve-url-loader'
                },
                {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true
                    }
                }
            ]
        };
    }
};

// Development module exports
module.exports = [
    merge(
        common.legacyConfig,
        {
            output: {
                filename: path.join('./js', '[name]-legacy.[hash].js'),
                publicPath: settings.devServerConfig.public() + '/'
            },
            mode: 'development',
            devtool: 'inline-source-map',
            devServer: configureDevServer(LEGACY_CONFIG),
            module: {
                rules: [
                    configureScssLoader(LEGACY_CONFIG),
                    configureImageLoader(LEGACY_CONFIG),
                ],
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
            ]
        }
    ),
    merge(
        common.modernConfig,
        {
            output: {
                filename: path.join('./js', '[name].[hash].js'),
                publicPath: settings.devServerConfig.public() + '/',
            },
            mode: 'development',
            devtool: 'inline-source-map',
            devServer: configureDevServer(MODERN_CONFIG),
            module: {
                rules: [
                    configureScssLoader(MODERN_CONFIG),
                    configureImageLoader(MODERN_CONFIG),
                ],
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
                new DashboardPlugin(),
            ]
        }
    ),
];