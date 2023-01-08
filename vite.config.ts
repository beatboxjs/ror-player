import { defineConfig } from 'vite';
import vue2Plugin from '@vitejs/plugin-vue';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';

export default defineConfig(({ mode }) => ({
    define: {
        'provess.env.DISABLE_SW': mode === 'development'
    },
    plugins: [
        vue2Plugin(),
        mdPlugin({ mode: [Mode.HTML] })
    ],
    build: {
        sourcemap: true
    }
}));
