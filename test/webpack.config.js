const devCerts = require("office-addin-dev-certs");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');

module.exports = async (env, options) => {
    const dev = options.mode === "development";
    const config = {
        devtool: "source-map",
        entry: {
            commands: path.resolve(__dirname, './../src/commands/commands.js'),
            functions: path.resolve(__dirname, './../src/functions/functions.js'),
            polyfill: "babel-polyfill",
            taskpane: path.resolve(__dirname, './src/test-taskpane.ts'),
        },
        resolve: {
            extensions: [".ts", ".tsx", ".html", ".js"]
        },
        node: {
            child_process: 'empty'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: "babel-loader"
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: "babel-loader"
                },
                {
                    test: /\.ts?$/,
                    exclude: /node_modules/,
                    use: "ts-loader"
                },
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    use: "html-loader"
                },
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    use: "file-loader"
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: dev ? [] : ["**/*"]
            }),
            new CustomFunctionsMetadataPlugin({
                output: "functions.json",
                input: path.resolve(__dirname, './../src/functions/functions.js')
            }),
            new HtmlWebpackPlugin({
                filename: "taskpane.html",
                template: path.resolve(__dirname, './src/test-taskpane.html'),
                chunks: ["polyfill", "taskpane", "functions", "commands"]
            }),
            new CopyWebpackPlugin([
                {
                    to: "taskpane.css",
                    from: path.resolve(__dirname, './../src/taskpane/taskpane.css')
                }
            ]),
        ],
        devServer: {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            https: (options.https !== undefined) ? options.https : await devCerts.getHttpsServerOptions(),
            port: process.env.npm_package_config_dev_server_port || 3000
        }
    };

    return config;
};