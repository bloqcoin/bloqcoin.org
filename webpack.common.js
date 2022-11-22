'use strict';

const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv-webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const entry = {
	'index': path.join(__dirname, './src/js/index.js'),
	'howto': path.join(__dirname, './src/js/howto.js'),
	'hash-rate': path.join(__dirname, './src/js/hash-rate.js'),
	'peers': path.join(__dirname, './src/js/peers.js'),
	'blocks': path.join(__dirname, './src/js/blocks.js'),
	'tx': path.join(__dirname, './src/js/tx.js'),
	'pool': path.join(__dirname, './src/js/pool.js')
};

const footer = fs.readFileSync('./src/html/partial/footer.html').toString();

const htmlPlugins = Object.keys(entry).map(function(key, index) {
	let title = 'New kind of storage, incentivized by cryptoeconomics';

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
		partial: {
			footer
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
				test: /\.(eot|otf|ttf|woff|woff2)$/i,
				exclude: path.resolve(__dirname, 'node_modules'),
				type: 'asset/resource'
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
