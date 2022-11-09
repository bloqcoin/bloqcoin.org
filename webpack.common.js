'use strict';

const path = require('path');

const dotenv = require('dotenv-webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const entry = {
	'index': path.join(__dirname, './src/js/index.js'),
	'node-status': path.join(__dirname, './src/js/node-status.js'),
	'peers': path.join(__dirname, './src/js/peers.js'),
	'blocks': path.join(__dirname, './src/js/blocks.js'),
	'tx-stats': path.join(__dirname, './src/js/tx-stats.js'),
	'mempool-summary': path.join(__dirname, './src/js/mempool-summary.js'),
	'unconfirmed-tx': path.join(__dirname, './src/js/unconfirmed-tx.js'),
	'mining-pools': path.join(__dirname, './src/js/mining-pools.js')
};

const htmlPlugins = Object.keys(entry).map(function(key, index) {
	let title = 'Innovative cdn network and a new kind of storage';

	if (key !== 'index') {
		title = `${key.replace(/_|-/g, ' ')}`;
		title = title.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
	}

	return new HtmlWebpackPlugin({
		title: title,
		meta: {
			'charset': 'utf-8',
			'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no'
		},
		favicon: './src/asset/favicon.svg',
		template: `./src/html/${key}.html`, // relative path to the HTML files
		filename: `${key}.html`, // output HTML files
		chunks: [`${key}`], // respective JS files
		minify: {
			html5: true,
			collapseWhitespace: true,
			removeComments: true,
			removeOptionalTags: false,
			removeRedundantAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true
		},
		inject: 'body',
		scriptLoading: 'module'
  	})
});

module.exports = {
	performance: {
        hints: "warning",
		maxEntrypointSize: Infinity,
        maxAssetSize: 4194304
    },
	entry: entry,
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/[name].css',
		}),
		new dotenv(),
		new CopyPlugin({
			patterns: [
				{ from: './src/asset/favicon.svg', to: 'favicon.svg' },
				{ from: './src/asset/favicon.ico', to: 'favicon.ico' },
			],
		})
	]
	.concat(htmlPlugins),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].js',
		assetModuleFilename: 'asset/[name][ext]',
		publicPath: '/',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				exclude: path.resolve(__dirname, 'node_modules'),
				type: 'asset',
				parser: {
					dataUrlCondition: {
						maxSize: 5 * 1024 // Inline anything under 5kb
					}
				}
			}
		]
	}
};