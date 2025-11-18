import { defineConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import audioFilesPlugin from './rollup-audio-files';
import { viteSingleFile } from "vite-plugin-singlefile";
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

export default defineConfig(({ mode }) => ({
	define: {
		'process.env.DISABLE_SW': String(mode === 'development'),
		'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version),
	},
	plugins: [
		vuePlugin(),
		mdPlugin({ mode: [Mode.HTML] }),
		audioFilesPlugin(),
		viteSingleFile()
	],
	build: {
		sourcemap: true,
		target: ["es2022", "chrome89", "edge89", "safari15", "firefox89", "opera75"],
	},
	test: {
		environment: 'happy-dom'
	}
}));
