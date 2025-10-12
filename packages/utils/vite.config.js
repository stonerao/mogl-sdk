import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'W3DUtils',
            formats: ['es', 'umd'],
            fileName: (format) => `w3d-utils.${format}.js`
        },
        rollupOptions: {
            external: [], // 无外部依赖
            output: {
                exports: 'named'
            }
        },
        sourcemap: true,
        minify: 'terser',
        target: 'es2015'
    }
});
