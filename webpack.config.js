const webpack = require("webpack");
const ngAnnotatePlugin = require("ng-annotate-webpack-plugin");

const duplicatePlugin = require("./webpack-duplicates");

const depLoaders = {
	jquery: "expose-loader?jQuery",
	"beatbox.js": "expose-loader?Beatbox",
	howler: "expose-loader?howler",
	angular: "expose-loader?angular"
};

// Add imports to these modules, as they don't specify their imports properly
const addDeps = {
	// Until https://github.com/webpack-contrib/css-loader/issues/51 is resolved we have to include CSS files by hand
	bootstrap: [ "bootstrap/dist/css/bootstrap.css" ],
	"angular-ui-bootstrap": [ "angular" ],
	"bootstrap-slider": [ "bootstrap-slider/dist/css/bootstrap-slider.css" ]
};

for(let i in addDeps) {
	let thisDep = `imports-loader?${addDeps[i].map((dep, i) => `fmImport${i}=${dep}`).join(",")}`;
	if(depLoaders[i])
		depLoaders[i] = [thisDep, ...(Array.isArray(depLoaders[i]) ? depLoaders[i] : [ depLoaders[i] ])];
	else
		depLoaders[i] = thisDep;
}

module.exports = {
	entry: [ "babel-polyfill", `${__dirname}/entry.js` ],
	output: {
		path: __dirname + "/build/",
		filename: "angular-beatbox.js"
	},
	module: {
		rules: [
			{ test: /\.css$/, use: [ "style-loader", "css-loader" ] },
			{ test: /\.scss$/, use: [ "style-loader", "css-loader", "sass-loader" ]},
			{ test: /\.js$/, exclude: /\/node_modules\//, loader: "babel-loader?presets=env" },
			{ test: /\.(png|jpe?g|gif|ttf|svg)$/, loader: "url-loader" },
			{ test: /\.html$/, loader: "html-loader?attrs[]=img:src&attrs[]=link:href" },
			{ test: /\.coffee$/, loader: "coffee-loader" },

			...Object.keys(depLoaders).map(key => ({ test: require.resolve(key), [Array.isArray(depLoaders[key]) ? "use" : "loader"]: depLoaders[key] })),

			{
				test: /\/node_modules\/bootstrap\/dist\/css\/bootstrap\.css$/,
				loader: "string-replace-loader",
				options: {
					multiple: [
						{ search: "src: url\\('\\.\\./fonts/glyphicons-halflings-regular.eot'\\);", replace: "", flags: "" },
						{ search: "src: url\\('\\.\\./fonts/glyphicons-halflings-regular\\..*", replace: "src: url('../fonts/glyphicons-halflings-regular.ttf') format('truetype');", flags: "" }
					]
				}
			}
		],
	},
	plugins: [
		new duplicatePlugin(),
		new ngAnnotatePlugin({
			add: true
		}),
		new webpack.ProvidePlugin({
		    $: "jquery",
		    jQuery: "jquery",
		    "window.jQuery": "jquery"
		}),
	],
	mode: "production",
	devtool: "source-map"
};
