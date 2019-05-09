/* eslint-env node */
const path = require("path")
// const babel = require("rollup-plugin-babel")
const replace = require("rollup-plugin-replace")
import typescript from 'rollup-plugin-typescript2'

module.exports = {
	input: path.resolve(__dirname, "./src/Saging.ts"),
	output: {
		file: path.resolve(__dirname, "./built/index.js"),
		format: 'cjs',
	},
	plugins: [
		// babel({
		// 	exclude: 'node_modules/**',
		// }),
		replace({
			NODE_ENV: JSON.stringify(process.env.NODE_ENV == "production" ? 'production' : 'develop'),
		}),
		typescript({
			clean: true,
			cacheRoot: './.rts2_cache',
		}),
	],
	// sourcemap: 'none',
}


