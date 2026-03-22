import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';

const input = 'src/index.ts';

/** @type {import('rollup').RollupOptions[]} */
export default [
	{
		input,
		output: [
			{
				file: input.replace('src/', 'dist/').replace('.ts', '.mjs'),
				format: 'esm',
			},
			{
				file: input.replace('src/', 'dist/').replace('.ts', '.cjs'),
				format: 'cjs',
			},
		],
		external: ['@koa/router', 'koa', 'reflect-metadata', 'tslib', /^koa\/.*/],
		plugins: [
			del({ targets: ['dist/*'] }),
			resolve({
				preferBuiltins: true,
				rootDir: 'src',
			}),
			typescript(),
			commonjs(),
			esbuild({
				target: 'node14',
			}),
		],
	},
	{
		input,
		output: [
			{
				file: input.replace('src/', 'dist/').replace('.ts', '.d.mts'),
				format: 'esm',
			},
			{
				file: input.replace('src/', 'dist/').replace('.ts', '.d.cts'),
				format: 'cjs',
			},
			{
				file: input.replace('src/', 'dist/').replace('.ts', '.d.ts'),
				format: 'esm',
			},
		],
		external: ['@koa/router', 'koa', 'reflect-metadata', 'tslib', /^koa\/.*/],
		plugins: [typescript(), dts({ respectExternal: true })],
	},
];
