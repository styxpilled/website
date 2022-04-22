const autoprefixer = require('autoprefixer');
const variables = require('postcss-simple-vars');
const atimport = require("postcss-import");
const presetenv = require('postcss-preset-env');
const nested = require('postcss-nested');
const atrule = require('postcss-extend-rule');
const short = require('postcss-short');

const config = {
	plugins: [
    atimport({
      path: ["src/styles"],
    }),
    variables,
    presetenv,
    nested,
    atrule,
		short,
    autoprefixer
]};

module.exports = config;
