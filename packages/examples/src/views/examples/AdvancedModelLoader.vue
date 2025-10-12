<template>
    <SplitLayout
        :code="sourceCode || '// 加载中...'"
        language="javascript"
        :title="'07 - Advanced Model Loader'"
    >
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-text">{{ loadingText || '加载中...' }}</p>
                <div class="loading-progress">
                    <div class="progress-bar" :style="{ width: `${loadingProgress || 0}%` }"></div>
                </div>
            </div>
        </div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">模型控制</h3>

            <!-- 模型信息 -->
            <div class="info-section">
                <h4>模型信息</h4>
                <div class="info-item">
                    <span>Mesh 数量:</span>
                    <span class="value">{{ meshCount || 0 }}</span>
                </div>
                <div class="info-item">
                    <span>当前选中:</span>
                    <span class="value">{{ selectedMeshName || '无' }}</span>
                </div>
            </div>

            <!-- Mesh 选择 -->
            <div class="control-section">
                <h4>选择 Mesh</h4>
                <select v-model="selectedMeshName" @change="onMeshSelect" class="mesh-select">
                    <option value="">请选择 Mesh</option>
                    <option v-for="name in meshNames || []" :key="name" :value="name">
                        {{ name }}
                    </option>
                </select>
            </div>

            <!-- 变换控制 -->
            <div v-if="selectedMesh" class="control-section">
                <h4>变换控制</h4>

                <!-- 位置控制 -->
                <div class="transform-group">
                    <label>位置 (Position)</label>
                    <div class="input-group">
                        <input
                            type="number"
                            v-model.number="meshTransform.position.x"
                            @input="updateMeshTransform"
                            step="0.1"
                            placeholder="X"
                        />
                        <input
                            type="number"
                            v-model.number="meshTransform.position.y"
                            @input="updateMeshTransform"
                            step="0.1"
                            placeholder="Y"
                        />
                        <input
                            type="number"
                            v-model.number="meshTransform.position.z"
                            @input="updateMeshTransform"
                            step="0.1"
                            placeholder="Z"
                        />
                    </div>
                </div>

                <!-- 旋转控制 -->
                <div class="transform-group">
                    <label>旋转 (Rotation)</label>
                    <div class="input-group">
                        <input
                            type="number"
                            v-model.number="meshTransform.rotation.x"
                            @input="updateMeshTransform"
                            step="0.1"
                            placeholder="X"
                        />
                        <input
                            type="number"
                            v-model.number="meshTransform.rotation.y"
                            @input="updateMeshTransform"
                            step="0.1"
                            placeholder="Y"
                        />
                        <input
                            type="number"
                            v-model.number="meshTransform.rotation.z"
                            @input="updateMeshTransform"
                            step="0.1"
                            placeholder="Z"
                        />
                    </div>
                </div>

                <!-- 缩放控制 -->
                <div class="transform-group">
                    <label>缩放 (Scale)</label>
                    <div class="input-group">
                        <input
                            type="number"
                            v-model.number="meshTransform.scale.x"
                            @input="updateMeshTransform"
                            step="0.1"
                            min="0.1"
                            placeholder="X"
                        />
                        <input
                            type="number"
                            v-model.number="meshTransform.scale.y"
                            @input="updateMeshTransform"
                            step="0.1"
                            min="0.1"
                            placeholder="Y"
                        />
                        <input
                            type="number"
                            v-model.number="meshTransform.scale.z"
                            @input="updateMeshTransform"
                            step="0.1"
                            min="0.1"
                            placeholder="Z"
                        />
                    </div>
                </div>

                <button @click="resetMeshTransform" class="reset-btn">重置变换</button>
            </div>

            <!-- 交互配置 -->
            <div class="control-section">
                <h4>交互配置</h4>
                <div class="interactive-config">
                    <label>事件监听模式</label>
                    <select v-model="interactiveMode" @change="updateInteractiveMode">
                        <option value="disabled">禁用所有事件</option>
                        <option value="all">启用所有 Mesh 事件</option>
                        <option value="selected">仅选中的 Mesh</option>
                    </select>

                    <div v-if="interactiveMode === 'selected'" class="selected-meshes">
                        <label>选择可交互的 Mesh</label>
                        <div class="mesh-checkboxes">
                            <div
                                v-for="meshName in availableMeshes || []"
                                :key="meshName"
                                class="mesh-checkbox"
                            >
                                <input
                                    type="checkbox"
                                    :id="`mesh-${meshName}`"
                                    v-model="selectedInteractiveMeshes"
                                    :value="meshName"
                                    @change="updateInteractiveMode"
                                />
                                <label :for="`mesh-${meshName}`">{{ meshName }}</label>
                            </div>
                        </div>
                    </div>

                    <div class="interactive-info">
                        <p>当前可交互对象数量: {{ currentInteractiveCount }}</p>
                        <p v-if="performanceWarning" class="warning">⚠️ {{ performanceWarning }}</p>
                    </div>
                </div>
            </div>

            <!-- 事件日志 -->
            <div class="control-section">
                <h4>事件日志</h4>
                <div class="event-log">
                    <div
                        v-for="(event, index) in eventLog || []"
                        :key="index"
                        class="event-item"
                        :class="`event-${event?.type || 'unknown'}`"
                    >
                        <span class="event-time">{{ event?.time || '' }}</span>
                        <span class="event-message">{{ event?.message || '' }}</span>
                    </div>
                </div>
                <button @click="clearEventLog" class="clear-btn">清空日志</button>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('初始化中...');
const loadingProgress = ref(0);

// 模型相关状态
const meshNames = ref([]);
const selectedMeshName = ref('');
const selectedMesh = ref(null);
const meshCount = computed(() => (meshNames.value || []).length);

// Mesh 变换状态
const meshTransform = reactive({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
});

// 事件日志
const eventLog = ref([]);

// 交互配置状态
const interactiveMode = ref('all'); // 'disabled', 'all', 'selected'
const availableMeshes = ref([]);
const selectedInteractiveMeshes = ref([]);
const currentInteractiveCount = ref(0);
const performanceWarning = ref('');

let scene = null;
let modelComponent = null;
let hdrComponent = null;

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [10, 8, 15],
    lookAt: [0, 0, 0]
  }
});

// 初始化场景
scene.init();

// 注册组件
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('HDRLoader', HDRLoader);

// 加载 HDR 环境贴图
const hdr = await scene.add('HDRLoader', {
  name: 'environment',
  url: '/textures/blouberg_sunrise_2_1k.hdr',
  asEnvironment: true,
  asBackground: true
});

// 加载 GLB 模型（配置交互事件）
const model = await scene.add('ModelLoader', {
  name: 'overview',
  url: '/models/kache.glb',
  scale: 1,
  position: [0, 0, 0],
  castShadow: true,
  receiveShadow: true,

  // ===== 交互事件配置 (interactiveMeshes) =====
  // 控制哪些 Mesh 可以响应鼠标事件（点击、移入、移出等）
  //
  // 配置选项：
  // 1. false (默认) - 禁用所有事件，最佳性能
  //    interactiveMeshes: false
  //
  // 2. '*' - 启用所有 Mesh 事件，性能影响较大
  //    当 Mesh 数量 > 50 时会显示性能警告
  //    interactiveMeshes: '*'
  //
  // 3. 数组 - 仅对指定名称的 Mesh 启用事件（推荐）
  //    interactiveMeshes: ['行政大楼', '办公楼A', '停车场']

  interactiveMeshes: '*'  // 演示用，实际项目建议使用数组指定
});

// ===== 其他配置模式示例 =====
//
// 示例1: 禁用所有事件（默认，最佳性能）
// const model1 = await scene.add('ModelLoader', {
//   url: '/models/building.glb',
//   interactiveMeshes: false  // 或者省略此配置项
// });
//
// 示例2: 仅对指定 Mesh 启用事件（推荐）
// const model2 = await scene.add('ModelLoader', {
//   url: '/models/building.glb',
//   interactiveMeshes: ['行政大楼', '办公楼A', '停车场']
// });
//
// 示例3: 对所有 Mesh 启用事件（谨慎使用）
// const model3 = await scene.add('ModelLoader', {
//   url: '/models/small-object.glb',
//   interactiveMeshes: '*'  // 当 Mesh 数量 > 50 时会显示性能警告
// });

// 获取所有 Mesh 名称
const meshNames = model.getMeshNames();
console.log('Available meshes:', meshNames);

// 查找特定 Mesh
const buildingMesh = model.getMeshByName('行政大楼');
if (buildingMesh) {
  // 设置 Mesh 属性
  buildingMesh.position.set(2, 0, 0);
  buildingMesh.rotation.set(0, Math.PI / 4, 0);
  buildingMesh.scale.set(1.2, 1.2, 1.2);
}

// ===== 动态修改交互配置 =====
// 运行时可以随时调整哪些 Mesh 可以响应事件

// 方式1: 仅对指定 Mesh 启用事件（推荐，性能最优）
// model.setInteractiveMeshes(['行政大楼', '办公楼A', '停车场']);

// 方式2: 启用所有 Mesh 事件（谨慎使用）
// model.setInteractiveMeshes('*');

// 方式3: 禁用所有事件（最佳性能）
// model.setInteractiveMeshes(false);

// 检查 Mesh 是否可交互
// const isInteractive = model.isMeshInteractive(someMesh);

// 获取当前可交互的对象列表
// const interactiveObjects = model.getInteractiveObjects();
// console.log('当前可交互对象数量:', interactiveObjects.length);

// 监听模型事件
model.on('click', (event) => {
  console.log('模型被点击:', event.object.name);
});

model.on('mouseenter', (event) => {
  console.log('鼠标移入模型:', event.object.name);
  // 高亮效果
  if (event.object.material) {
    event.object.material.emissive.setHex(0x444444);
  }
});

model.on('mouseleave', (event) => {
  console.log('鼠标移出模型:', event.object.name);
  // 移除高亮
  if (event.object.material) {
    event.object.material.emissive.setHex(0x000000);
  }
});

// ===== 性能最佳实践 =====
// 1. 默认禁用事件：对于纯展示的模型，使用 interactiveMeshes: false
// 2. 精确指定：只对需要交互的关键 Mesh 启用事件
// 3. 避免全量启用：当模型包含大量 Mesh (> 50) 时，避免使用 '*'
// 4. 性能监控：启用全部事件时，控制台会显示性能警告

// 启动渲染
scene.start();`;

onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('初始化场景失败:', error);
        isLoading.value = false;
        loadingText.value = '初始化失败: ' + error.message;
    }
});

onUnmounted(() => {
    cleanup();
});

// 初始化场景
const initScene = async () => {
    if (!sceneContainer.value) return;

    try {
        isLoading.value = true;
        loadingText.value = '初始化场景...';
        loadingProgress.value = 10;
        // 创建场景
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [10, 8, 15],
                lookAt: [0, 0, 0]
            }
        });

        // 初始化场景
        scene.init();

        // 添加基础灯光
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.4
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [10, 10, 5],
            castShadow: true
        });

        // 启用阴影
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        // 注册组件
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('HDRLoader', HDRLoader);

        loadingProgress.value = 30;

        // 加载 HDR 环境贴图
        await loadHDREnvironment();

        loadingProgress.value = 60;

        // 加载模型
        await loadModel();

        loadingProgress.value = 100;

        // 启动渲染
        scene.start();

        // 设置事件监听
        setupEventListeners();

        addEventLog('success', '场景初始化完成');
    } catch (error) {
        console.error('Scene initialization failed:', error);
        addEventLog('error', `场景初始化失败: ${error.message}`);
    } finally {
        isLoading.value = false;
    }
};

// 加载 HDR 环境贴图
const loadHDREnvironment = async () => {
    try {
        loadingText.value = '加载 HDR 环境贴图...';

        hdrComponent = await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            asEnvironment: true,
            asBackground: true
        });

        // 监听加载进度
        hdrComponent.on('loadProgress', (event) => {
            const progress = 30 + event.progress * 30; // 30-60%
            loadingProgress.value = progress;
        });

        hdrComponent.on('loadComplete', () => {
            addEventLog('success', 'HDR 环境贴图加载完成');
        });

        hdrComponent.on('loadError', (event) => {
            addEventLog('error', `HDR 加载失败: ${event.error.message}`);
        });
    } catch (error) {
        console.error('HDR loading failed:', error);
        addEventLog('error', `HDR 加载失败: ${error.message}`);
    }
};

// 加载模型
const loadModel = async () => {
    try {
        loadingText.value = '加载 3D 模型...';

        modelComponent = await scene.add('ModelLoader', {
            name: 'overview',
            url: '/models/kache.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: true,
            receiveShadow: true,
            interactiveMeshes: '*' // 启用所有 Mesh 的事件监听（演示用）
        });

        // 监听加载进度
        modelComponent.on('loadProgress', (event) => {
            const progress = 60 + event.progress * 40; // 60-100%
            loadingProgress.value = progress;
        });

        modelComponent.on('loadComplete', () => {
            // 获取所有 Mesh 名称
            meshNames.value = modelComponent.getMeshNames();
            availableMeshes.value = [...meshNames.value];

            // 初始化交互配置状态
            updateInteractiveStatus();

            addEventLog('success', `模型加载完成，包含 ${meshNames.value.length} 个 Mesh`);
            console.log('Available meshes:', meshNames.value);
        });

        modelComponent.on('loadError', (event) => {
            addEventLog('error', `模型加载失败: ${event.error.message}`);
        });
    } catch (error) {
        console.error('Model loading failed:', error);
        addEventLog('error', `模型加载失败: ${error.message}`);
    }
};

// 设置事件监听
const setupEventListeners = () => {
    if (!modelComponent) return;

    // 监听模型点击事件
    modelComponent.on('click', (event) => {
        const meshName = event.object.name || '未命名 Mesh';
        addEventLog('click', `点击了 Mesh: ${meshName}`);

        // 自动选中被点击的 Mesh
        if (event.object.name && meshNames.value.includes(event.object.name)) {
            selectedMeshName.value = event.object.name;
            onMeshSelect();
        }
    });

    // 监听鼠标移入事件
    modelComponent.on('mouseenter', (event) => {
        const meshName = event.object.name || '未命名 Mesh';
        addEventLog('hover', `鼠标移入 Mesh: ${meshName}`);

        // 添加高亮效果
        if (event.object.material) {
            if (Array.isArray(event.object.material)) {
                event.object.material.forEach((material) => {
                    material.emissive.setHex(0x444444);
                });
            } else {
                event.object.material.emissive.setHex(0x444444);
            }
        }
    });

    // 监听鼠标移出事件
    modelComponent.on('mouseleave', (event) => {
        const meshName = event.object.name || '未命名 Mesh';
        addEventLog('hover', `鼠标移出 Mesh: ${meshName}`);

        // 移除高亮效果
        if (event.object.material) {
            if (Array.isArray(event.object.material)) {
                event.object.material.forEach((material) => {
                    material.emissive.setHex(0x000000);
                });
            } else {
                event.object.material.emissive.setHex(0x000000);
            }
        }
    });
};

// Mesh 选择处理
const onMeshSelect = () => {
    if (!selectedMeshName.value || !modelComponent) {
        selectedMesh.value = null;
        return;
    }

    // 获取选中的 Mesh
    selectedMesh.value = modelComponent.getMeshByName(selectedMeshName.value);

    if (selectedMesh.value) {
        // 更新变换控制器的值
        meshTransform.position.x = selectedMesh.value.position.x;
        meshTransform.position.y = selectedMesh.value.position.y;
        meshTransform.position.z = selectedMesh.value.position.z;

        meshTransform.rotation.x = selectedMesh.value.rotation.x;
        meshTransform.rotation.y = selectedMesh.value.rotation.y;
        meshTransform.rotation.z = selectedMesh.value.rotation.z;

        meshTransform.scale.x = selectedMesh.value.scale.x;
        meshTransform.scale.y = selectedMesh.value.scale.y;
        meshTransform.scale.z = selectedMesh.value.scale.z;

        addEventLog('info', `选中 Mesh: ${selectedMeshName.value}`);
    }
};

// 更新 Mesh 变换
const updateMeshTransform = () => {
    if (!selectedMesh.value) return;

    // 应用位置变换
    selectedMesh.value.position.set(
        meshTransform.position.x,
        meshTransform.position.y,
        meshTransform.position.z
    );

    // 应用旋转变换
    selectedMesh.value.rotation.set(
        meshTransform.rotation.x,
        meshTransform.rotation.y,
        meshTransform.rotation.z
    );

    // 应用缩放变换
    selectedMesh.value.scale.set(
        meshTransform.scale.x,
        meshTransform.scale.y,
        meshTransform.scale.z
    );
};

// 重置 Mesh 变换
const resetMeshTransform = () => {
    if (!selectedMesh.value) return;

    // 重置为默认值
    meshTransform.position.x = 0;
    meshTransform.position.y = 0;
    meshTransform.position.z = 0;

    meshTransform.rotation.x = 0;
    meshTransform.rotation.y = 0;
    meshTransform.rotation.z = 0;

    meshTransform.scale.x = 1;
    meshTransform.scale.y = 1;
    meshTransform.scale.z = 1;

    // 应用重置
    updateMeshTransform();

    addEventLog('info', `重置 Mesh 变换: ${selectedMeshName.value}`);
};

// 添加事件日志
const addEventLog = (type, message) => {
    try {
        const now = new Date();
        const time = now.toLocaleTimeString();

        if (!eventLog.value) {
            eventLog.value = [];
        }

        eventLog.value.unshift({
            type,
            message,
            time
        });

        // 限制日志数量
        if (eventLog.value.length > 50) {
            eventLog.value = eventLog.value.slice(0, 50);
        }
    } catch (error) {
        console.error('添加事件日志失败:', error);
    }
};

// 清空事件日志
const clearEventLog = () => {
    eventLog.value = [];
    addEventLog('info', '事件日志已清空');
};

// 更新交互模式
const updateInteractiveMode = () => {
    if (!modelComponent) return;

    let config;
    switch (interactiveMode.value) {
        case 'disabled':
            config = false;
            break;
        case 'all':
            config = '*';
            break;
        case 'selected':
            config =
                selectedInteractiveMeshes.value.length > 0
                    ? selectedInteractiveMeshes.value
                    : false;
            break;
        default:
            config = false;
    }

    // 应用配置
    modelComponent.setInteractiveMeshes(config);

    // 更新状态
    updateInteractiveStatus();

    // 记录日志
    addEventLog('info', `交互模式已更新: ${getInteractiveModeDescription()}`);
};

// 更新交互状态信息
const updateInteractiveStatus = () => {
    if (!modelComponent) return;

    const interactiveObjects = modelComponent.getInteractiveObjects();
    currentInteractiveCount.value = interactiveObjects.length;

    // 性能警告
    if (interactiveMode.value === 'all' && availableMeshes.value.length > 50) {
        performanceWarning.value = `启用所有 ${availableMeshes.value.length} 个 Mesh 的事件可能影响性能`;
    } else {
        performanceWarning.value = '';
    }
};

// 获取交互模式描述
const getInteractiveModeDescription = () => {
    switch (interactiveMode.value) {
        case 'disabled':
            return '禁用所有事件';
        case 'all':
            return `启用所有 ${availableMeshes.value.length} 个 Mesh 的事件`;
        case 'selected':
            return `启用 ${selectedInteractiveMeshes.value.length} 个指定 Mesh 的事件`;
        default:
            return '未知模式';
    }
};

// 清理资源
const cleanup = () => {
    console.log('Cleaning up Advanced Model Loader example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    modelComponent = null;
    hdrComponent = null;
    selectedMesh.value = null;
    meshNames.value = [];
    selectedMeshName.value = '';
    eventLog.value = [];
};
</script>

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-content {
    text-align: center;
    color: white;
    max-width: 300px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 16px;
    margin-bottom: 15px;
}

.loading-progress {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #00ff88, #00ccff);
    transition: width 0.3s ease;
}

.control-panel {
    position: absolute;
    top: 60px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-size: 14px;
    min-width: 280px;
    max-width: 350px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
    font-size: 18px;
    margin-bottom: 16px;
    border-bottom: 2px solid #00ff88;
    padding-bottom: 8px;
    font-weight: 600;
    color: #00ff88;
}

.info-section,
.control-section {
    margin-bottom: 20px;
}

.info-section h4,
.control-section h4 {
    font-size: 14px;
    margin-bottom: 10px;
    color: #00ccff;
    font-weight: 500;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    align-items: center;
}

.info-item span:first-child {
    opacity: 0.8;
    font-size: 13px;
}

.info-item .value {
    font-weight: bold;
    color: #00ff88;
    font-family: 'Consolas', monospace;
}

.mesh-select {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 13px;
}

.mesh-select:focus {
    outline: none;
    border-color: #00ff88;
}

.transform-group {
    margin-bottom: 15px;
}

.transform-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #00ccff;
    font-weight: 500;
}

.input-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
}

.input-group input {
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 12px;
    text-align: center;
}

.input-group input:focus {
    outline: none;
    border-color: #00ff88;
}

.reset-btn,
.clear-btn {
    width: 100%;
    padding: 8px 12px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.reset-btn:hover,
.clear-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.event-log {
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
}

.event-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    padding: 4px 6px;
    border-radius: 4px;
}

.event-click {
    background: rgba(255, 193, 7, 0.2);
    border-left: 3px solid #ffc107;
}

.event-hover {
    background: rgba(0, 123, 255, 0.2);
    border-left: 3px solid #007bff;
}

.event-success {
    background: rgba(40, 167, 69, 0.2);
    border-left: 3px solid #28a745;
}

.event-error {
    background: rgba(220, 53, 69, 0.2);
    border-left: 3px solid #dc3545;
}

.event-info {
    background: rgba(23, 162, 184, 0.2);
    border-left: 3px solid #17a2b8;
}

.event-time {
    font-family: 'Consolas', monospace;
    opacity: 0.7;
    margin-right: 8px;
    min-width: 60px;
}

.event-message {
    flex: 1;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.event-log::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.event-log::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.event-log::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.event-log::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* 交互配置样式 */
.interactive-config {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.interactive-config select {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 13px;
    cursor: pointer;
}

.interactive-config select:focus {
    outline: none;
    border-color: #00ff88;
}

.interactive-config option {
    background: #1a1a1a;
    color: white;
}

.selected-meshes {
    margin-top: 8px;
}

.mesh-checkboxes {
    max-height: 150px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 8px;
    margin-top: 6px;
}

.mesh-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mesh-checkbox:last-child {
    border-bottom: none;
}

.mesh-checkbox input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #00ff88;
}

.mesh-checkbox label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    flex: 1;
}

.interactive-info {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    padding: 10px;
    font-size: 12px;
}

.interactive-info p {
    margin: 4px 0;
    color: rgba(255, 255, 255, 0.8);
}

.interactive-info .warning {
    color: #ffaa00;
    font-weight: 500;
}
</style>
