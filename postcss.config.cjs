module.exports = {
  plugins: [require("tailwindcss"), require("autoprefixer"), require("./framework/build/postcss-token-layer.cjs")()],
};
