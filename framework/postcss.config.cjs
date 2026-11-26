module.exports = {
  plugins: [require("tailwindcss"), require("autoprefixer"), require("./build/postcss-token-layer.cjs")()],
};
