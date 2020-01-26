const webpack = require("webpack");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const duplicatePlugin = require("./webpack-duplicates");

const dev = process.argv[1].includes('webpack-dev-server');

const depLoaders = {
	jquery: "expose-loader?jQuery",
	"beatbox.js": "expose-loader?Beatbox",
	howler: "expose-loader?howler"
};

module.exports = {
	entry: `${__dirname}/src/app.ts`,
	output: {
		path: __dirname + "/build/",
		filename: "ror-player.js"
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
			{
				test: /\.ts$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: [
								[ "@babel/preset-env", { useBuiltIns: "usage", corejs: 3 } ],
								"@babel/preset-typescript"
							],
							plugins: [
								[ "@babel/plugin-proposal-decorators", { legacy: true } ],
								[ "@babel/plugin-proposal-class-properties", { loose: true } ]
							]
						}
					}
				]
			},

			{ test: /\.(png|jpe?g|gif|svg)$/, loader: "url-loader" },
			{ test: /\.(html|vue)$/, loader: "html-loader?attrs[]=img:src&attrs[]=link:href" },
			{ test: /\.coffee$/, loader: "coffee-loader" },
			{ test: /\.md$/, use: [ "html-loader?attrs[]=img:src&attrs[]=link:href", "markdown-loader" ]},

			...Object.keys(depLoaders).map(key => ({ test: require.resolve(key), [Array.isArray(depLoaders[key]) ? "use" : "loader"]: depLoaders[key] }))
		],
	},
	plugins: [
		new duplicatePlugin(),
		new webpack.ProvidePlugin({
		    $: "jquery",
		    jQuery: "jquery",
		    "window.jQuery": "jquery"
		}),
		new HtmlWebpackPlugin({
			template: "./index.html",
			inlineSource: "\.js$"
		}),
		new HtmlWebpackInlineSourcePlugin(),
		new ForkTsCheckerWebpackPlugin(),
		new CopyPlugin([
			{ from: `${__dirname}/src/sw.js`, to: `${__dirname}/build/sw.js` }
		]),
		new webpack.EnvironmentPlugin({
			DISABLE_SW: dev
		}),
		//new BundleAnalyzerPlugin()
	],
	mode: dev ? "development" : "production",
	devtool: dev ? "cheap-module-eval-source-map" : "source-map",
	performance: {
		hints: false
	}
};
