import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());
  const enableMock = env.VITE_ENABLE_MOCK === 'true';

  return {
    plugins: [vue()],

    // 路径别名配置
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@core': resolve(__dirname, 'src/core'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@store': resolve(__dirname, 'src/store'),
        '@config': resolve(__dirname, 'src/config'),
        '@assets': resolve(__dirname, 'src/assets')
      }
    },

    // 服务器配置
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true,
      cors: true,

      // 配置 Mock 服务中间件
      async configure(server) {
        if (enableMock) {
          console.log('\n🎭 Mock 服务已启用\n');

          // 动态导入 Mock 中间件
          const { createMockMiddleware } = await import('./mock/index.js');
          const mockMiddleware = createMockMiddleware();

          // 注册 Mock 中间件
          server.middlewares.use(mockMiddleware);

          console.log('📋 Mock API 列表:');
          console.log('  - GET    /api/mock/user/current       获取当前用户信息');
          console.log('  - POST   /api/mock/user/login         用户登录');
          console.log('  - GET    /api/mock/users              获取用户列表');
          console.log('  - GET    /api/mock/projects           获取项目列表');
          console.log('  - POST   /api/mock/project            创建项目');
          console.log('  - GET    /api/mock/assets             获取资源列表');
          console.log('  - 更多 API 请查看 mock/index.js\n');
        }
      }
    },

    // 构建配置
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus'],
            'three': ['three'],
            'w3d': ['@w3d/core', '@w3d/utils']
          }
        }
      }
    },

    // 优化配置
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'element-plus', 'three', '@w3d/core', '@w3d/utils']
    }
  };
});

