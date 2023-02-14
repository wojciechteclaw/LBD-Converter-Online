const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
    plugins: [
        new HTMLWebpackPlugin({
            template: "./public/index.html",
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "public/assets",
                    to: "assets",
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                },
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        alias: {
            "@assets": path.resolve(process.cwd(), "./src/assets/"),
            "@components": path.resolve(process.cwd(), "./src/components/"),
            "@enums": path.resolve(process.cwd(), "./src/enums/"),
            "@helpers": path.resolve(process.cwd(), "./src/helpers/"),
            "@hooks": path.resolve(process.cwd(), "./src/hooks/"),
            "@services": path.resolve(process.cwd(), "./src/services/"),
        },
        extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
};
