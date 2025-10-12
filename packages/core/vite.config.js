import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'W3D',
            formats: ['es', 'umd'],
            fileName: (format) => `w3d-core.${format}.js`
        },
        rollupOptions: {
            // 外部化 Three.js，不打包进库
            external: ['three', /^three\//, '@w3d/utils'],
            output: {
                // 全局变量名
                globals: {
                    three: 'THREE',
                    '@w3d/utils': 'W3DUtils',
                    'three/examples/jsm/controls/OrbitControls.js': 'THREE.OrbitControls',
                    'three/examples/jsm/loaders/GLTFLoader.js': 'THREE.GLTFLoader',
                    'three/examples/jsm/loaders/DRACOLoader.js': 'THREE.DRACOLoader'
                },
                // 导出方式
                exports: 'named',
                // 代码分割
                manualChunks: undefined
            }
        },
        // 压缩配置
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        // sourcemap
        sourcemap: true,
        // 目标环境
        target: 'es2015',
        // 清空输出目录
        emptyOutDir: true
    },
    // 开发服务器
    server: {
        port: 3000,
        open: true
    },
    // 路径别名
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@w3d/utils': path.resolve(__dirname, '../utils/src')
        }
    }
});
