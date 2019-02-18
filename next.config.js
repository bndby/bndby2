// next.config.js
const withCSS = require('@zeit/next-css')
module.exports = withCSS({
	
	cssModules: true,
	webpack: function (config) {
		return config;
	},

	exportPathMap: function () {
		return {
			'/': { page: '/' },
			'/deploy/': {page: '/deploy'}
		}
	}
})
