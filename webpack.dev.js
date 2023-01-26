const { merge } = require("webpack-merge");
const webpackConfig = require("./webpack.config");

module.exports = merge(webpackConfig, {
    mode: "development",
    entry: "./src/index.tsx",
    devServer: {
        port: 3333,
        open: true,
        hot: true,
        client: {
            overlay: false,
        },
    },
});
