import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'W3DComponents',
            formats: ['es', 'umd'],
            fileName: (format) => `w3d-components.${format}.js`
        },
        rollupOptions: {
            external: ['three', '@w3d/core', '@w3d/utils'],
            output: {
                globals: {
                    three: 'THREE',
                    '@w3d/core': 'W3D',
                    '@w3d/utils': 'W3DUtils'
                },
                exports: 'named'
            }
        },
        sourcemap: true,
        minify: 'terser',
        target: 'es2015'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@w3d/core': path.resolve(__dirname, '../core/src'),
            '@w3d/utils': path.resolve(__dirname, '../utils/src')
        }
    }
});
