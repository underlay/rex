module.exports = {
	// Enable sourcemaps for debugging webpack's output.
	devtool: "source-map",

	entry: ["babel-polyfill", __dirname + "/index.jsx"],

	output: {
		filename: "index.min.js",
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
				options: { publicPath: "dist", name: "[name].[ext]" },
				loader: "file-loader",
			},
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader",
			},
			// {
			// 	test: /\.(t|j)sx?$/,
			// 	exclude: /node_modules/,
			// 	use: { loader: "ts-loader" },
			// },
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

	// When importing a module whose path matches one of the following, just
	// assume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dependencies, which allows browsers to cache those libraries between builds.
	externals: {
		react: "React",
		"react-dom": "ReactDOM",
	},
}
