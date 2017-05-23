/**
 * Bernd Wessels (https://github.com/BerndWessels/)
 *
 * Copyright © 2017 Bernd Wessels. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

/**
 * Import dependencies.
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');
const contains = require('ramda/src/contains');

/**
 * Export the build configuration.
 */
module.exports = function () {
  // Get the build environment.
  const DEV = process.env.NODE_ENV === 'development';
  const WEB = process.env.TARGET === 'web';
  const AWS = process.env.TARGET === 'serverless';
  const BASEURL = process.env.BASEURL;
  const RESOURCEPATH = process.env.RESOURCEPATH || '';
  const HTTPS = contains('--https', process.argv);
  // Build sass loaders.
  function getSassLoaders(modules) {
    return []
      .concat(DEV ? [
        {
          //https://github.com/webpack-contrib/style-loader
          loader: 'style-loader'
        }] : [])
      .concat([
        {
          // https://github.com/webpack-contrib/css-loader
          loader: 'css-loader',
          options: Object.assign({
              sourceMap: true,
              modules: modules,
              importLoaders: 2
            },
            DEV ? {
              localIdentName: "[path]---[name]---[local]---[hash:base64:5]"
            } : {}
          )
        },
        {
          // https://github.com/postcss/postcss-loader
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            plugins: function () {
              return [
                autoprefixer({browsers: ['last 1 versions']})
              ];
            }
          }
        },
        {
          // https://github.com/bholloway/resolve-url-loader
          loader: 'resolve-url-loader'
        },
        {
          // https://github.com/webpack-contrib/sass-loader
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            includePaths: ['node_modules', 'node_modules/@material/*']
              .map((d) => path.join(__dirname, d))
              .map((g) => glob.sync(g))
              .reduce((a, c) => a.concat(c), [])
          }
        }
      ]);
  }

  // Build and export the build configuration.
  return {
    // https://webpack.js.org/configuration/target
    target: WEB ? 'web' : 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    // https://webpack.js.org/configuration/entry-context
    entry: {
      index: path.resolve(__dirname, WEB ? './website/src/index.client.js' : AWS ? './server/src/serverless.js' : './server/src/server.js')
    },
    // https://webpack.js.org/configuration/output
    output: {
      filename: WEB ? '[name].[hash].js' : '[name].js',
      path: path.resolve(__dirname, WEB ? './dist/client' : AWS ? './dist' : './dist/server'),
      publicPath: RESOURCEPATH // AWS ? '/_/' : ''
    },
    // https://webpack.js.org/configuration/resolve
    resolve: {
      alias: {
        'preact': 'preact',
        'react': 'preact-compat',
        'react-dom': 'preact-compat',
        'react-redux': 'preact-redux'
      },
      extensions: ['.js', '.jsx', '.json', '.scss'],
      modules: ['node_modules']
    },
    // https://webpack.js.org/configuration/module
    module: {
      noParse: /\.min\.js/,
      rules: [{
        test: /\.jsx?$/,
        exclude: [/node_modules(?!([\/\\]preact-mdc|[\/\\]aws-serverless-express))/],
        use: [{
          // https://github.com/babel/babel-loader
          loader: 'babel-loader',
          options: {
            presets: [
              ['es2015', {loose: true, modules: false}]
            ],
            plugins: [
              'transform-class-properties',
              'transform-object-rest-spread',
              ['transform-react-jsx', {pragma: 'h'}]
            ]
          },
        }]
      }, {
        test: /(\.scss|\.css)$/,
        exclude: [/node_modules/, /normalize.css/, /icomoon/],
        use: DEV ? getSassLoaders(true) : ExtractTextPlugin.extract(getSassLoaders(true))
      }, {
        test: /(\.scss|\.css)$/,
        include: [/node_modules/],
        use: DEV ? getSassLoaders(false) : ExtractTextPlugin.extract(getSassLoaders(false))
      }, {
        // https://github.com/webpack/file-loader
        test: /\.(svg|woff|woff2|ttf|eot)$/,
        loader: 'file-loader?name=assets/fonts/[name].[hash].[ext]'
      }]
    },
    // https://webpack.js.org/configuration/plugins
    plugins: [
      // https://github.com/johnagan/clean-webpack-plugin
      new CleanWebpackPlugin(WEB ? ['dist/client'] : AWS ? ['dist'] : ['dist/server'], __dirname),
      // https://github.com/kossnocorp/on-build-webpack
      // new WebpackOnBuildPlugin(function(stats) {
      //   console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      //   let list = fs.readdirSync(path.resolve(__dirname, './dist/server'));
      //   list.forEach(i => console.log(i));
      // }),
      // https://webpack.js.org/plugins/loader-options-plugin
      new webpack.LoaderOptionsPlugin({
        minimize: !DEV,
        debug: !DEV
      }),
      // https://webpack.js.org/plugins/define-plugin
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(DEV ? 'development' : 'production'),
          WEB: JSON.stringify(WEB),
          BASE_URL: JSON.stringify(BASEURL),
          RESOURCE_PATH: JSON.stringify(RESOURCEPATH)
        }
      })
    ].concat(WEB ? [
      // https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([
        {from: './website/public'}
      ]),
      // https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin(Object.assign({
        template: path.resolve(__dirname, './website/src/index.ejs'),
        inject: false,
        baseurl: BASEURL,
        manifest: 'manifest.json',
        themeColor: '#333',
        favIcon: 'favicon.ico',
        resourcePath: RESOURCEPATH
      }, !DEV ? {
        serviceWorker: 'service-worker.js'
      } : {}))
    ] : [])
      .concat(DEV ? [
        // prints more readable module names in the browser console on HMR updates
        new webpack.NamedModulesPlugin()
      ] : [])
      .concat(!DEV ? [
        // https://github.com/webpack-contrib/extract-text-webpack-plugin
        new ExtractTextPlugin({
          filename: '[name].[hash].css'
        }),
        // https://github.com/webpack-contrib/uglifyjs-webpack-plugin
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true,
            warnings: false
          },
          output: {
            comments: false,
            screw_ie8: true
          },
          mangle: {
            screw_ie8: true
          },
          sourceMap: true
        })
      ] : [])
      .concat(!DEV && WEB ? [
        new SWPrecacheWebpackPlugin(
          {
            cacheId: 'wessels.nz', // TODO
            filename: 'service-worker.js',
            stripPrefix: path.join(__dirname, 'dist/client').replace(/\\/g, RESOURCEPATH),
            maximumFileSizeToCacheInBytes: 4194304,
            minify: false,
            runtimeCaching: [{
              handler: 'cacheFirst',
              urlPattern: /[.]mp3$/,
            }],
          }
        )
      ] : []),
    // https://webpack.js.org/configuration/devtool
    devtool: DEV ? 'cheap-module-eval-source-map' : 'source-map',
    // https://webpack.js.org/configuration/other-options/#bail
    bail: !DEV,
    // https://webpack.js.org/configuration/stats
    stats: {
      colors: true
    },
    // https://webpack.js.org/configuration/dev-server
    devServer: HTTPS ? {
      port: process.env.PORT,
      host: process.env.HOST,
      publicPath: '/',
      contentBase: './website/src',
      historyApiFallback: true,
      key: fs.readFileSync(path.resolve(__dirname, './certificates/domain.key')),
      cert: fs.readFileSync(path.resolve(__dirname, './certificates/domain.crt'))
    } : {
      port: process.env.PORT,
      host: process.env.HOST,
      publicPath: '/',
      contentBase: './website/src',
      historyApiFallback: true
    }
  };
};
