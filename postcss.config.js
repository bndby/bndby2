module.exports = {
	plugins: [
		require( 'postcss-import' )(),
		require( 'postcss-preset-env' )({
			stage: 0,
			autoprefixer: {
				grid: true,
				browsers: [ 'last 4 versions', 'ie >= 11', 'iOS >= 9' ],
			}
		})
	]
}