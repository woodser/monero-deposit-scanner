
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin');
const appDirectory = fs.realpathSync(process.cwd());

const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);

const host = process.env.HOST || 'localhost';

process.env.NODE_ENV = 'development';

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: "javascript/auto",
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: false,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    esmodules: true,
                  }
                }
              ],
              "@babel/preset-react",
              
            ]
          },
        }
      },
      {
        // Preprocess your css files
        // you can add additional loaders here (e.g. sass/less etc.)
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|jp2|webp)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
  mode: 'development',
  devtool: 'source-map',
  entry: resolveAppPath('src/main/index.js'),
  output: {
    filename: 'static/js/bundle.js',
  },
  devServer: {
    contentBase: resolveAppPath('/src/main'), //directory where the app entry file lives
    compress: true, //compress served content as gzip
    hot: true, //enable hot reloading - modifying file causes browser to refresh with updates
    host, //default to localhost
    port: 8080,
    publicPath: '/', // the path that the person viewing the page/app sees in the url bar
    writeToDisk: true,
  },
  // tell HtmlWebpackPlugin to use index.html as the source file
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: resolveAppPath('src/main/index.html'),
    }),
    new NodePolyfillPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve("node_modules/monero-javascript/dist"), to: path.resolve("dist") },
      ],
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      "child_process": false,
      "fs": false
    }
  },
};