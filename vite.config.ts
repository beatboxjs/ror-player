import { defineConfig } from 'vite';
import vue2Plugin from '@vitejs/plugin-vue';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import audioFilesPlugin from './rollup-audio-files';

export default defineConfig(({ mode }) => ({
	define: {
		'process.env.DISABLE_SW': mode === 'development'
	},
	plugins: [
		vue2Plugin(),
		mdPlugin({ mode: [Mode.HTML] }),
		audioFilesPlugin()
	],
	build: {
		sourcemap: true,
		target: ["es2022", "chrome89", "edge89", "safari15", "firefox89", "opera75"],
	},
	test: {
		environment: 'happy-dom'
	}
}));
