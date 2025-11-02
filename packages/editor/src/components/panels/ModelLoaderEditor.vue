<template>
    <div class="modelloader-editor">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner">⏳</div>
            <div class="loading-text">加载模型中...</div>
            <div v-if="loadProgress > 0" class="loading-progress">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: loadProgress * 100 + '%' }"></div>
                </div>
                <div class="progress-text">{{ Math.round(loadProgress * 100) }}%</div>
            </div>
        </div>

        <!-- 模型信息 -->
        <div v-else-if="modelInstance" class="model-info">
            <!-- Mesh 列表 -->
            <div class="info-section">
                <div class="section-header">
                    <span class="section-title">📦 Mesh 列表</span>
                    <span class="section-count">{{ meshList.length }}</span>
                </div>
                <div v-if="meshList.length > 0" class="mesh-list">
                    <div
                        v-for="(mesh, index) in meshList"
                        :key="mesh.uuid"
                        class="mesh-item"
                        :class="{ 'interactive': isInteractiveMesh(mesh.name) }"
                    >
                        <div class="mesh-info">
                            <span class="mesh-index">{{ index + 1 }}</span>
                            <span class="mesh-name">{{ mesh.name || '未命名' }}</span>
                        </div>
                        <div class="mesh-actions">
                            <button
                                v-if="interactiveMeshes !== false && interactiveMeshes !== '*'"
                                class="btn-toggle-interactive"
                                :class="{ 'active': isInteractiveMesh(mesh.name) }"
                                @click="toggleMeshInteractive(mesh.name)"
                                :title="isInteractiveMesh(mesh.name) ? '禁用交互' : '启用交互'"
                            >
                                {{ isInteractiveMesh(mesh.name) ? '🟢' : '⚪' }}
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-list">暂无 Mesh</div>
            </div>

            <!-- 动画列表 -->
            <div v-if="animationList.length > 0" class="info-section">
                <div class="section-header">
                    <span class="section-title">🎬 动画列表</span>
                    <span class="section-count">{{ animationList.length }}</span>
                </div>
                <div class="animation-list">
                    <div
                        v-for="(animation, index) in animationList"
                        :key="index"
                        class="animation-item"
                        :class="{ 'playing': currentAnimation === animation }"
                    >
                        <div class="animation-info">
                            <span class="animation-index">{{ index + 1 }}</span>
                            <span class="animation-name">{{ animation }}</span>
                        </div>
                        <div class="animation-actions">
                            <button
                                class="btn-play"
                                @click="playAnimation(index)"
                                :title="currentAnimation === animation ? '正在播放' : '播放'"
                            >
                                {{ currentAnimation === animation ? '⏸️' : '▶️' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 动画控制 -->
                <div v-if="currentAnimation" class="animation-controls">
                    <div class="control-row">
                        <label>播放速度</label>
                        <Slider
                            :model-value="animationSpeed"
                            @update:model-value="setAnimationSpeed"
                            :min="0.1"
                            :max="3"
                            :step="0.1"
                        />
                        <span class="speed-value">{{ animationSpeed.toFixed(1) }}x</span>
                    </div>
                    <div class="control-buttons">
                        <button class="btn-control" @click="pauseAnimation">暂停</button>
                        <button class="btn-control" @click="resumeAnimation">继续</button>
                        <button class="btn-control" @click="stopAnimation">停止</button>
                    </div>
                </div>
            </div>

            <!-- 交互配置 -->
            <div v-if="interactiveMeshes === 'custom'" class="info-section">
                <div class="section-header">
                    <span class="section-title">🎯 交互配置</span>
                </div>
                <div class="interactive-config">
                    <div class="config-info">
                        已启用 {{ interactiveMeshNames.length }} 个 Mesh 的交互事件
                    </div>
                    <div class="config-actions">
                        <button class="btn-action" @click="enableAllMeshes">全部启用</button>
                        <button class="btn-action" @click="disableAllMeshes">全部禁用</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 未加载状态 -->
        <div v-else class="empty-state">
            <div class="empty-icon">📦</div>
            <div class="empty-text">请先配置模型 URL 并加载模型</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useComponentStore } from '@/stores/useComponentStore';
import Slider from '@/components/ui/Slider.vue';

const componentStore = useComponentStore();

// Props
const props = defineProps({
    componentId: {
        type: String,
        required: true
    }
});

// 状态
const isLoading = ref(false);
const loadProgress = ref(0);
const meshList = ref([]);
const animationList = ref([]);
const currentAnimation = ref(null);
const animationSpeed = ref(1.0);
const interactiveMeshNames = ref([]);

// 计算属性
const component = computed(() => {
    return componentStore.components.find((c) => c.id === props.componentId);
});

const modelInstance = computed(() => {
    return component.value?.instance;
});

const interactiveMeshes = computed(() => {
    return component.value?.config?.interactiveMeshes || false;
});

// 方法
const loadModelInfo = () => {
    if (!modelInstance.value) return;

    try {
        // 获取 Mesh 列表
        const meshes = modelInstance.value.getAllMeshes?.() || [];
        meshList.value = meshes.map((mesh) => ({
            name: mesh.name || '未命名',
            uuid: mesh.uuid
        }));

        // 获取动画列表
        const animations = modelInstance.value.getAnimationNames?.() || [];
        animationList.value = animations;

        // 获取当前播放的动画
        currentAnimation.value = modelInstance.value.getCurrentAnimationName?.() || null;

        // 获取交互 Mesh 列表
        if (Array.isArray(interactiveMeshes.value)) {
            interactiveMeshNames.value = [...interactiveMeshes.value];
        } else {
            interactiveMeshNames.value = [];
        }

        console.log('[ModelLoaderEditor] Model info loaded:', {
            meshes: meshList.value.length,
            animations: animationList.value.length
        });
    } catch (error) {
        console.error('[ModelLoaderEditor] Failed to load model info:', error);
    }
};

const isInteractiveMesh = (meshName) => {
    if (interactiveMeshes.value === '*') return true;
    if (Array.isArray(interactiveMeshes.value)) {
        return interactiveMeshes.value.includes(meshName);
    }
    return false;
};

const toggleMeshInteractive = (meshName) => {
    const newList = [...interactiveMeshNames.value];
    const index = newList.indexOf(meshName);

    if (index > -1) {
        newList.splice(index, 1);
    } else {
        newList.push(meshName);
    }

    interactiveMeshNames.value = newList;

    // 更新组件配置
    componentStore.updateComponent(props.componentId, {
        config: {
            ...component.value.config,
            interactiveMeshes: newList
        }
    });

    // 更新实例
    if (modelInstance.value?.setInteractiveMeshes) {
        modelInstance.value.setInteractiveMeshes(newList);
    }
};

const enableAllMeshes = () => {
    const allMeshNames = meshList.value.map((m) => m.name).filter((n) => n);
    interactiveMeshNames.value = allMeshNames;

    componentStore.updateComponent(props.componentId, {
        config: {
            ...component.value.config,
            interactiveMeshes: allMeshNames
        }
    });

    if (modelInstance.value?.setInteractiveMeshes) {
        modelInstance.value.setInteractiveMeshes(allMeshNames);
    }
};

const disableAllMeshes = () => {
    interactiveMeshNames.value = [];

    componentStore.updateComponent(props.componentId, {
        config: {
            ...component.value.config,
            interactiveMeshes: []
        }
    });

    if (modelInstance.value?.setInteractiveMeshes) {
        modelInstance.value.setInteractiveMeshes([]);
    }
};

const playAnimation = (index) => {
    if (!modelInstance.value?.playAnimation) return;

    try {
        modelInstance.value.playAnimation(index);
        currentAnimation.value = animationList.value[index];
    } catch (error) {
        console.error('[ModelLoaderEditor] Failed to play animation:', error);
    }
};

const pauseAnimation = () => {
    if (modelInstance.value?.pauseAnimation) {
        modelInstance.value.pauseAnimation();
    }
};

const resumeAnimation = () => {
    if (modelInstance.value?.resumeAnimation) {
        modelInstance.value.resumeAnimation();
    }
};

const stopAnimation = () => {
    if (modelInstance.value?.stopAnimation) {
        modelInstance.value.stopAnimation();
        currentAnimation.value = null;
    }
};

const setAnimationSpeed = (speed) => {
    animationSpeed.value = speed;
    if (modelInstance.value?.setAnimationSpeed) {
        modelInstance.value.setAnimationSpeed(speed);
    }
};

// 监听模型实例变化
watch(modelInstance, (newInstance) => {
    if (newInstance) {
        loadModelInfo();
    }
}, { immediate: true });

// 监听加载事件
let loadStartHandler = null;
let loadProgressHandler = null;
let loadCompleteHandler = null;

onMounted(() => {
    if (modelInstance.value) {
        loadModelInfo();

        // 监听加载事件
        loadStartHandler = () => {
            isLoading.value = true;
            loadProgress.value = 0;
        };

        loadProgressHandler = (data) => {
            loadProgress.value = data.progress;
        };

        loadCompleteHandler = () => {
            isLoading.value = false;
            loadProgress.value = 1;
            loadModelInfo();
        };

        modelInstance.value.on?.('loadStart', loadStartHandler);
        modelInstance.value.on?.('loadProgress', loadProgressHandler);
        modelInstance.value.on?.('loadComplete', loadCompleteHandler);
    }
});

onUnmounted(() => {
    if (modelInstance.value) {
        modelInstance.value.off?.('loadStart', loadStartHandler);
        modelInstance.value.off?.('loadProgress', loadProgressHandler);
        modelInstance.value.off?.('loadComplete', loadCompleteHandler);
    }
});
</script>

<style scoped>
.modelloader-editor {

}

.loading-state,
.empty-state {
    @apply flex flex-col items-center justify-center py-8 text-center;
}

.loading-spinner,
.empty-icon {
    @apply text-4xl mb-2;
}

.loading-text,
.empty-text {
    @apply text-sm text-gray-600;
}

.loading-progress {
    @apply w-full mt-4;
}

.progress-bar {
    @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
    @apply h-full bg-primary-500 transition-all duration-300;
}

.progress-text {
    @apply text-xs text-gray-500 mt-1 text-center;
}

.model-info {
    @apply space-y-4;
}

.info-section {
    @apply border border-gray-200 rounded-lg p-3;
}

.section-header {
    @apply flex items-center justify-between mb-2 pb-2 border-b border-gray-200;
}

.section-title {
    @apply text-sm font-medium text-gray-700;
}

.section-count {
    @apply text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded;
}

.mesh-list,
.animation-list {
    @apply space-y-1 max-h-48 overflow-y-auto;
}

.mesh-item,
.animation-item {
    @apply flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors;
}

.mesh-item.interactive {
    @apply bg-green-50;
}

.animation-item.playing {
    @apply bg-blue-50;
}

.mesh-info,
.animation-info {
    @apply flex items-center gap-2 flex-1;
}

.mesh-index,
.animation-index {
    @apply text-xs text-gray-400 w-6;
}

.mesh-name,
.animation-name {
    @apply text-sm text-gray-700 truncate;
}

.mesh-actions,
.animation-actions {
    @apply flex items-center gap-1;
}

.btn-toggle-interactive,
.btn-play {
    @apply text-lg cursor-pointer hover:scale-110 transition-transform;
}

.btn-toggle-interactive.active {
    @apply text-green-500;
}

.animation-controls {
    @apply mt-3 pt-3 border-t border-gray-200 space-y-2;
}

.control-row {
    @apply flex items-center gap-2;
}

.control-row label {
    @apply text-xs text-gray-600 w-16;
}

.speed-value {
    @apply text-xs text-gray-600 w-10 text-right;
}

.control-buttons {
    @apply flex gap-2;
}

.btn-control,
.btn-action {
    @apply px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors;
}

.interactive-config {
    @apply space-y-2;
}

.config-info {
    @apply text-sm text-gray-600;
}

.config-actions {
    @apply flex gap-2;
}

.empty-list {
    @apply text-sm text-gray-400 text-center py-4;
}
</style>

