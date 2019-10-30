module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-color-function')(),
    require('postcss-preset-env')({
      stage: 0,
      autoprefixer: {
        grid: true,
      },
    }),
  ],
};
