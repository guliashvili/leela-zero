const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");

const config = {
  entry: "./src/app.tsx",
  output: {
    path: path.join(__dirname, "/public"),
    filename: "bundle.min.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.css?$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"],
      },
    ],
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    ...nodeExternals(),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "index.html",
    }),
    new MiniCssExtractPlugin(),
  ],
};

module.exports = (env, argv) => {
  config.mode = argv.mode;

  if (argv.mode === "development") {
    config.devtool = "inline-source-map";
  }

  if (argv.mode === "production") {
  }
  return config;
};
