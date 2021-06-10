const devPresets = ["@vue/babel-preset-app"];
const buildPresets = [
  [
    "@babel/preset-env",
    {
      corejs: 3
    }
  ]
];
module.exports = {
  presets: process.env.NODE_ENV === "development" ? devPresets : buildPresets
};
