const path = require("path");


module.exports = {
	experiments: {
		outputModule: true,
	},
	entry: {
		index: {
			import: "./src/index.ts",
			dependOn: ['Binary', 'accounts', 'node', 'transactions'],
		},
		Binary: {
			import: "./src/Binary.ts"
		},
		accounts: {
			import: "./src/accounts/index.ts",
			dependOn: ['Binary', 'errors'],
		},
		errors: {
			import: "./src/errors/index.ts"
		},
		events: {
			import: "./src/events/index.ts",
			dependOn: ['Binary'],
		},
		http: {
			import: "./src/http/index.ts",
			dependOn: ['Binary', 'accounts'],
		},
		identities: {
			import: "./src/identities/index.ts",
			dependOn: ['accounts', 'transactions'],
		},
		node: {
			import: "./src/node/index.ts",
			dependOn: ['accounts', 'transactions', 'errors'],
		},
		transactions: {
			import: "./src/transactions/index.ts",
			dependOn: ['Binary']
		},
	},
	devtool: "inline-source-map",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js",
		asyncChunks: true,
		library: {
			name: "lto",
			type: "amd"
		}
	},
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			chunks: 'all',
		},
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
		},
	},
	externals: {
		"jsrsasign": "jsrsasign"
	},
};
