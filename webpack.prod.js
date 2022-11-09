'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

// minify
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const zlib = require('zlib');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				test: /\.js(\?.*)?$/i,
			}),
			new CssMinimizerPlugin({
				parallel: true,
				test: /\.css$/i,
			})
		]
	},
	plugins: [
		new CompressionPlugin({
			filename: '[path][base].br',
			algorithm: 'brotliCompress',
			test: /\.(js|css|html|svg)$/,
			compressionOptions: {
				params: {
					[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY // 11
				}
			}
		})
	]	
});