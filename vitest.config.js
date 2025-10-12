import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // 测试环境
        environment: 'jsdom',
        
        // 覆盖率
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.spec.js',
                '**/*.test.js',
                '**/examples/**',
                '**/scripts/**'
            ]
        },
        
        // 全局变量
        globals: true,
        
        // 测试文件匹配
        include: ['packages/**/*.{test,spec}.js'],
        
        // 超时时间
        testTimeout: 10000,
        
        // 并发
        threads: true,
        
        // 监听模式
        watch: false
    }
});

