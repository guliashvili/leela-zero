const config = {
  entry: {
    app: "./src/app.tsx",
    ish_go_logic: "./src/ish.go.logic.tsx",
    ish_go_view: "./src/ish.go.view.h5.tsx",
    ish_go: "./src/ish.go.tsx",
    controller: "./src/controller.tsx",
  },
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    hot: true,
  },
  output: {
    path: __dirname + "/public",
    filename: "build/[name].app.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
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
