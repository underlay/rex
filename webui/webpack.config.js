const { resolve } = require("path")

module.exports = {
	devtool: "source-map",

	entry: {
		index: ["babel-polyfill", __dirname + "/index.jsx"],
		worker: ["babel-polyfill", "./worker.js"],
	},

	output: {
		filename: "[name].min.js",
		path: resolve(__dirname, "lib"),
	},

	resolve: {
		extensions: [".js", ".jsx", ".shex", ".nt", ".css"],
		alias: { stream: "readable-stream", path: "path-browserify" },
	},

	node: {
		fs: "empty",
		stream: "empty",
	},

	module: {
		rules: [
			{
				test: /\.(shex|nt|css)$/,
				exclude: /shex\.js/,
				options: { publicPath: "lib", name: "[name].[ext]" },
				loader: "file-loader",
			},
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader",
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
					},
				},
			},
		],
	},
	externals: {
		jsonld: "jsonld",
		react: "React",
		"react-dom": "ReactDOM",
	},
}
