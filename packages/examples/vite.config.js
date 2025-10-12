import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    // Vue 插件
    plugins: [vue()],

    // 开发服务器
    server: {
        port: 8090,
        open: true,
        cors: true
    },

    // 构建配置
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    vue: ['vue', 'vue-router'],
                    w3d: ['@w3d/core', '@w3d/components', '@w3d/utils']
                }
            }
        },
        minify: 'terser',
        chunkSizeWarningLimit: 1000
    },

    // 路径别名
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@w3d/core': path.resolve(__dirname, '../core/src'),
            '@w3d/components': path.resolve(__dirname, '../components/src'),
            '@w3d/utils': path.resolve(__dirname, '../utils/src')
        }
    },

    // 优化配置
    optimizeDeps: {
        include: ['three', 'vue', 'vue-router', 'prismjs'],
        exclude: ['@w3d/core', '@w3d/components', '@w3d/utils']
    }
});
