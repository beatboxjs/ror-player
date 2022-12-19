/// <reference types="./build-shims" />
import webpack, { Configuration } from "webpack";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlWebpackInlineSourcePlugin from "html-webpack-inline-source-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { compile, CompilerOptions } from "vue-template-compiler";
import svgToMiniDataURI from "mini-svg-data-uri";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import "webpack-dev-server";
import { fileURLToPath } from 'url';

/* const expose = {
	jquery: "jQuery",
	"beatbox.js": "Beatbox"
}; */

export default async (env: any, argv: any): Promise<Configuration> => {
	const isDev = argv.mode == "development";

	return {
		entry: fileURLToPath(new URL('./src/app.ts', import.meta.url)),
		output: {
			path: fileURLToPath(new URL("./dist/", import.meta.url)),
			filename: "ror-player.js",
			publicPath: "/" // Workaround for https://github.com/DustinJackson/html-webpack-inline-source-plugin/issues/57
		},
		resolve: {
			extensions: [ ".ts", ".js" ],
			extensionAlias: {
				".js": [".js", ".ts"],
				".cjs": [".cjs", ".cts"],
				".mjs": [".mjs", ".mts"]
			},
			alias: {
				vue: "vue/dist/vue.runtime.esm.js"
			}
		},
		module: {
			rules: [
				{ test: /\.css$/, use: [ "style-loader", "css-loader" ] },
				{ test: /\.scss$/, use: [ "style-loader", "css-loader", "sass-loader" ]},
				{ test: /\.ts$/, loader: "ts-loader" },
				{ test: /\.(png|jpe?g|gif)$/, type: "asset/inline" },
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

				// Currently breaks ESM imports
				/* ...await Promise.all(Object.entries(expose).map(async ([key, value]) => ({
					test: fileURLToPath(await import.meta.resolve!(key)),
					loader: "expose-loader",
					sideEffects: false,
					options: {
						exposes: [value]
					}
				}))) */
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
					{ from: fileURLToPath(new URL('./src/sw.js', import.meta.url)), to: fileURLToPath(new URL('./dist/sw.js', import.meta.url)) },
					{ from: fileURLToPath(new URL('./assets/img/app-512.png', import.meta.url)), to: fileURLToPath(new URL('./dist/app-512.png', import.meta.url)) },
					{ from: fileURLToPath(new URL('./assets/img/app-180.png', import.meta.url)), to: fileURLToPath(new URL('./dist/app-180.png', import.meta.url)) },
					{ from: fileURLToPath(new URL('./assets/img/favicon.svg', import.meta.url)), to: fileURLToPath(new URL('./dist/favicon.svg', import.meta.url)) },
					{ from: fileURLToPath(new URL('./assets/manifest.json', import.meta.url)), to: fileURLToPath(new URL('./dist/manifest.json', import.meta.url)) }
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
			hot: "only",
			allowedHosts: "all"
		}
	}
};