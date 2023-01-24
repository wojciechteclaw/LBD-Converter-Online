const HTMLWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    plugins: [
        new HTMLWebpackPlugin({
            template: "./src/index.html",
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
            "@components": path.resolve(process.cwd(), "./src/components/"),
            "@services": path.resolve(process.cwd(), "./src/services/"),
            "@hooks": path.resolve(process.cwd(), "./src/hooks/"),
        },
        extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
};
