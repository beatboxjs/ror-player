/// <reference types="./build-shims" />
import webpack, { Configuration } from "webpack";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlWebpackInlineSourcePlugin from "html-webpack-inline-source-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const expose = {
	jquery: "jQuery",
	"beatbox.js": "Beatbox",
	howler: "howler"
};

export default (env: any, argv: any): Configuration => {
	const isDev = argv.mode == "development";

	return {
		entry: `${__dirname}/src/app.ts`,
		output: {
			path: __dirname + "/dist/",
			filename: "ror-player.js",
			publicPath: "/" // Workaround for https://github.com/DustinJackson/html-webpack-inline-source-plugin/issues/57
		},
		resolve: {
			extensions: [ ".ts", ".js" ],
			alias: {
				vue: "vue/dist/vue.js"
			}
		},
		module: {
			rules: [
				{ test: /\.css$/, use: [ "style-loader", "css-loader" ] },
				{ test: /\.scss$/, use: [ "style-loader", "css-loader", "sass-loader" ]},
				{
					resource: { and: [ /\.js$/, [
						__dirname + "/app/",
						fs.realpathSync(__dirname + "/node_modules/beatbox.js/src/"),
						fs.realpathSync(__dirname + "/node_modules/beatbox.js-export/src/")
					] ] },
					use: {
						loader: "babel-loader",
						options: {
							presets: [ "@babel/preset-env" ]
						}
					}
				},
				{ test: /\.ts$/, loader: "ts-loader" },
				{ test: /\.(png|jpe?g|gif|svg)$/, type: "asset/inline" },
				{ test: /\.(html|vue)$/, loader: "html-loader" },
				{ test: /\.coffee$/, loader: "coffee-loader" },
				{ test: /\.md$/, use: [ "html-loader", "markdown-loader" ]},
				...Object.entries(expose).map(([key, value]) => ({
					test: require.resolve(key),
					loader: "expose-loader",
					options: {
						exposes: [value]
					}
				}))
			],
		},
		plugins: [
			new webpack.ProvidePlugin({
				$: "jquery",
				jQuery: "jquery",
				"window.jQuery": "jquery"
			}),
			new HtmlWebpackPlugin({
				template: "./index.html",
				inlineSource: "\.js$",
				inject: "body"
			}),
			...(isDev ? [] : [new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)]),
			new CopyPlugin({
				patterns: [
					{ from: `${__dirname}/src/sw.js`, to: `${__dirname}/dist/sw.js` }
				]
			}),
			new webpack.EnvironmentPlugin({
				DISABLE_SW: isDev
			}),
			//new BundleAnalyzerPlugin()
		],
		mode: isDev ? "development" : "production",
		devtool: isDev ? "eval-cheap-module-source-map" : "source-map",
		performance: {
			hints: false
		},
		devServer: {
			hotOnly: true,
			disableHostCheck: true,
		}
	}
};