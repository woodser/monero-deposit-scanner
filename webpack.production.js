const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
	contentBase: path.join(__dirname, 'dist'),
	compress: true,
	port: 8080,
  },
  //Why does devtool not work?
  //devtool: "cheap-module-eval-source-map", // a sourcemap type. map to orig source with line number
  plugins: [new HtmlWebpackPlugin()], // automatically create an "index.html"
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};
