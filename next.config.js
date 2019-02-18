// next.config.js
const withCSS = require('@zeit/next-css')
module.exports = withCSS({
	exportPathMap: function () {
		return {
			'/': { page: '/' },
			'/deploy': {page: '/deploy'}
		}
	}
})
