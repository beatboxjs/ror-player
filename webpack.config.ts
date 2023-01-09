/// <reference types="./build-shims" />
import webpack, { Configuration } from "webpack";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlWebpackInlineSourcePlugin from "html-webpack-inline-source-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { compile, CompilerOptions } from "vue-template-compiler";
import svgToMiniDataURI from "mini-svg-data-uri";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
const path = require("path");

const expose = {
	jquery: "jQuery",
	"beatbox.js": "Beatbox"
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
				vue: "vue/dist/vue.runtime.esm.js",
				"@": path.resolve(__dirname, "./src")
			}
		},
		module: {
			rules: [
				{ test: /\.css$/, use: [ "style-loader", "css-loader" ] },
				{ test: /\.scss$/, use: [ "style-loader", "css-loader", "sass-loader" ]},
				{ test: /\.ts$/, loader: "ts-loader" },
				{ test: /\.(png|jpe?g|gif|woff2|pdf)$/, type: "asset/resource" },
				{
					test: /\.(svg)$/,
					type: 'asset/inline',
					generator: {
						dataUrl: (content: any) => {
							content = content.toString();
							return svgToMiniDataURI(content);
						}
					}
				},
				{
					test: /\.html$/,
					loader: "html-loader",
					options: {
						sources: {
							list: [
								{ tag: "img", attribute: "src", type: "src" },
								{ tag: "link", attribute: "href", type: "src", filter: (tag: any, attr: any, attrs: any) => attrs.some((a: any) => a.name == "rel" && ["icon"].includes(a.value)) },
							]
						}
					}
				},
				{
					test: /\.vue$/,
					loader: "vue-template-loader",
					options: {
						transformAssetUrls: {
							img: 'src'
						},
						compiler: {
							compile: (template: string, options: CompilerOptions) => compile(template, { ...options, whitespace: "condense" })
						}
					}
				},
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
					{ from: `${__dirname}/src/sw.js`, to: `${__dirname}/dist/sw.js` },
					{ from: `${__dirname}/assets/img/app-512.png`, to: `${__dirname}/dist/app-512.png` },
					{ from: `${__dirname}/assets/img/app-180.png`, to: `${__dirname}/dist/app-180.png` },
					{ from: `${__dirname}/assets/img/favicon.png`, to: `${__dirname}/dist/favicon.png` },
					{ from: `${__dirname}/assets/manifest.json`, to: `${__dirname}/dist/manifest.json` }
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