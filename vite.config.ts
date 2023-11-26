import { defineConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import audioFilesPlugin from './rollup-audio-files';
import { viteSingleFile } from "vite-plugin-singlefile";
import tuneDescriptionsPlugin from './rollup-tune-descriptions';

export default defineConfig(({ mode }) => ({
	define: {
		'process.env.DISABLE_SW': mode === 'development'
	},
	plugins: [
		vuePlugin(),
		mdPlugin({ mode: [Mode.HTML] }),
		audioFilesPlugin(),
		viteSingleFile(),
		tuneDescriptionsPlugin()
	],
	build: {
		sourcemap: true,
		target: ["es2022", "chrome89", "edge89", "safari15", "firefox89", "opera75"],
	},
	test: {
		environment: 'happy-dom'
	}
}));
