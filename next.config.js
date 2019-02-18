// next.config.js
const withCSS = require('@zeit/next-css')
module.exports = withCSS({
	webpack: ( config, options ) => {
		config.module.rules.push({
			test: /\.svg$/,
			loader: 'file-loader'
		})
		return config
	}
  })
