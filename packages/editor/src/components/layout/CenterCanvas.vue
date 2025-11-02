<template>
    <div class="center-canvas canvas-container">
        <!-- 3D 场景容器 -->
        <div ref="canvasRef" class="w-full h-full"></div>

        <!-- 加载提示 -->
        <div
            v-if="sceneState.loading"
            class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-10"
        >
            <div class="text-center">
                <div class="text-lg font-medium text-gray-700 mb-2">正在初始化场景...</div>
                <div class="loading-spinner"></div>
            </div>
        </div>

        <!-- 错误提示 -->
        <div
            v-if="sceneState.error"
            class="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 z-10"
        >
            <div class="text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <div class="text-lg font-medium text-red-700 mb-2">场景初始化失败</div>
                <div class="text-sm text-red-600">{{ sceneState.error }}</div>
                <button
                    class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    @click="retryInit"
                >
                    重试
                </button>
            </div>
        </div>

        <!-- 场景信息显示 -->
        <div
            v-if="sceneState.initialized && !sceneState.loading"
            class="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-xs z-10"
        >
            <div>FPS: {{ fps }}</div>
            <div>组件数: {{ components.length }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useScene } from '@/composables/useScene';
import { useComponent } from '@/composables/useComponent';

const canvasRef = ref(null);
const fps = ref(60);

// 使用场景管理
const { sceneInstance, sceneState, initScene, disposeScene } = useScene();

// 使用组件管理
const { components } = useComponent();

// FPS 计算
let lastTime = performance.now();
let frames = 0;

onMounted(async () => {
    await initializeScene();
});

onUnmounted(() => {
    cleanup();
});

/**
 * 初始化场景
 */
const initializeScene = async () => {
    if (!canvasRef.value) {
        console.error('Canvas container not found');
        return;
    }

    try {
        const scene = await initScene(canvasRef.value);

        // 设置动画循环
        setupAnimationLoop(scene);

        console.log('✅ Scene initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize scene:', error);
    }
};

/**
 * 设置动画循环
 */
const setupAnimationLoop = (scene) => {
    const originalAnimate = scene.animate.bind(scene);

    scene.animate = function () {
        originalAnimate();

        // 计算 FPS
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
            fps.value = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
        }
    };
};

/**
 * 重试初始化
 */
const retryInit = async () => {
    cleanup();
    await initializeScene();
};

/**
 * 清理资源
 */
const cleanup = () => {
    console.log('Cleaning up scene...');
    disposeScene();
};
</script>

<style scoped>
.center-canvas {
    position: relative;
    background: #1a1a1a;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

