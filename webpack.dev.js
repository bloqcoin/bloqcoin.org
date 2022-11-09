'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const zlib = require('zlib');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	watchOptions: {
		ignored: ['dist', 'node_modules']
	},
	plugins: [
		new CompressionPlugin({
			filename: '[path][base].br',
			algorithm: 'brotliCompress',
			test: /\.(js|css|html|svg)$/,
			compressionOptions: {
				params: {
					[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MIN_QUALITY
				}
			}
		})
	]
});