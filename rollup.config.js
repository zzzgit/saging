/* eslint-env node */
const path = require("path")
// const babel = require("rollup-plugin-babel")
const replace = require("rollup-plugin-replace")
import typescript from 'rollup-plugin-typescript2'
const pkg = require("./package.json")

module.exports = {
	input: path.resolve(__dirname, "./src/Saging.ts"),
	output: {
		file: path.resolve(__dirname, pkg.main),
		format: 'cjs',
		name: "saging",
		banner: "/* eslint-disable */",
	},
	plugins: [
		// babel({
		// 	exclude: 'node_modules/**',
		// }),
		replace({
			NODE_ENV: JSON.stringify(process.env.NODE_ENV === "production" ? 'production' : 'develop'),
		}),
		typescript({
			cacheRoot: './.rts2_cache',
			useTsconfigDeclarationDir: true,
			clean: false,
		}),
	],
	// sourcemap: 'none',
}
