const path = require("path");


module.exports = {
	experiments: {
		outputModule: true,
	},
	entry: "./src/index.ts",
	devtool: "inline-source-map",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "build.js",
		library: {
			name: "lto",
			type: "amd"
		}
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		]
	},
	resolve: {
		extensions: [ ".ts", ".js"],
		fallback: {
			"fs": false,
			"tls": false,
			"net": false,
			"path": false,
			"zlib": false,
			"http": false,
			"https": false,
			"stream": false,
			"crypto": false,
			"crypto-browserify": require.resolve("crypto-browserify"),
		},
	},
};
