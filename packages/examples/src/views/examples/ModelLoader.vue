<template>
    <SplitLayout :code="sourceCode" language="javascript" title="04 - Model Loader">
        <div class="scene-container" ref="sceneContainer">
            <!-- 加载状态 -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- 控制面板 -->
            <template v-if="!isLoading">
                <GuiPanel title="模型加载器" width="wide">
                    <!-- 模型加载 -->
                    <GuiSection title="模型加载">
                        <GuiTextInput
                            label="模型 URL"
                            v-model="modelConfig.url"
                            placeholder="输入模型文件 URL"
                            @keyup.enter="loadModel"
                        />
                        <div class="button-group">
                            <GuiButton
                                label="加载模型"
                                :disabled="!modelConfig.url"
                                @click="loadModel"
                            />
                            <GuiButton
                                label="清除模型"
                                variant="secondary"
                                :disabled="!currentModel"
                                @click="clearModel"
                            />
                        </div>
                    </GuiSection>

                    <!-- 模型变换 -->
                    <template v-if="currentModel">
                        <GuiSection title="模型变换">
                            <!-- 位置控制 -->
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="X"
                                    v-model="modelTransform.position.x"
                                    :step="0.1"
                                    @update:modelValue="updateModelTransform"
                                />
                                <GuiNumberInput
                                    label="Y"
                                    v-model="modelTransform.position.y"
                                    :step="0.1"
                                    @update:modelValue="updateModelTransform"
                                />
                                <GuiNumberInput
                                    label="Z"
                                    v-model="modelTransform.position.z"
                                    :step="0.1"
                                    @update:modelValue="updateModelTransform"
                                />
                            </div>

                            <!-- 旋转控制 -->
                            <GuiSlider
                                label="旋转 X 轴"
                                v-model="modelTransform.rotation.x"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateModelTransform"
                            />
                            <GuiSlider
                                label="旋转 Y 轴"
                                v-model="modelTransform.rotation.y"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateModelTransform"
                            />
                            <GuiSlider
                                label="旋转 Z 轴"
                                v-model="modelTransform.rotation.z"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateModelTransform"
                            />

                            <!-- 缩放控制 -->
                            <GuiSlider
                                label="统一缩放"
                                v-model="modelTransform.scale.uniform"
                                :min="0.1"
                                :max="3"
                                :step="0.1"
                                :precision="1"
                                suffix="x"
                                @update:modelValue="updateUniformScale"
                            />
                            <GuiCheckbox
                                label="锁定比例"
                                v-model="modelTransform.scale.lockAspect"
                                @update:modelValue="updateModelTransform"
                            />
                        </GuiSection>
                    </template>

                    <!-- 交互事件配置 -->
                    <template v-if="currentModel">
                        <GuiSection title="交互事件配置">
                            <GuiSelect
                                label="交互模式"
                                v-model="interactionConfig.mode"
                                :options="[
                                    { value: 'disabled', label: '禁用' },
                                    { value: 'all', label: '全部启用' },
                                    { value: 'selected', label: '选择性启用' }
                                ]"
                                @update:modelValue="updateInteractionMode"
                            />

                            <template v-if="interactionConfig.mode === 'selected'">
                                <div class="mesh-list">
                                    <div
                                        v-for="mesh in availableMeshes"
                                        :key="mesh.name"
                                        class="mesh-item"
                                    >
                                        <GuiCheckbox
                                            :label="mesh.name"
                                            :modelValue="
                                                interactionConfig.selectedMeshes.includes(mesh.name)
                                            "
                                            @update:modelValue="
                                                (val) => {
                                                    if (val) {
                                                        interactionConfig.selectedMeshes.push(
                                                            mesh.name
                                                        );
                                                    } else {
                                                        interactionConfig.selectedMeshes =
                                                            interactionConfig.selectedMeshes.filter(
                                                                (m) => m !== mesh.name
                                                            );
                                                    }
                                                    updateInteractionMode();
                                                }
                                            "
                                        />
                                    </div>
                                </div>
                            </template>

                            <GuiInfoItem label="当前可交互对象" :value="currentInteractiveCount" />
                            <template v-if="performanceWarning">
                                <div class="warning">⚠️ {{ performanceWarning }}</div>
                            </template>
                        </GuiSection>
                    </template>

                    <!-- 模型信息 -->
                    <template v-if="currentModel">
                        <GuiSection title="模型信息">
                            <GuiInfoItem label="Mesh 数量" :value="modelInfo.meshCount" />
                            <GuiInfoItem label="材质数量" :value="modelInfo.materialCount" />
                            <GuiInfoItem label="顶点数量" :value="modelInfo.vertexCount" />
                            <GuiInfoItem label="文件大小" :value="modelInfo.fileSize" />
                        </GuiSection>
                    </template>

                    <!-- 重置按钮 -->
                    <GuiSection title="操作">
                        <GuiButton
                            label="重置变换"
                            :disabled="!currentModel"
                            @click="resetTransform"
                        />
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, GridHelper } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiColorPicker,
    GuiSelect,
    GuiCheckbox,
    GuiButton,
    GuiInfoItem,
    GuiLoading,
    GuiNumberInput,
    GuiTextInput
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import * as THREE from 'three';

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('');
const loadingProgress = ref(0);

// 模型配置
const modelConfig = reactive({
    url: '/models/ShaderBall.glb'
});

// 模型变换状态
const modelTransform = reactive({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { uniform: 1, lockAspect: true }
});

// 交互配置
const interactionConfig = reactive({
    mode: 'disabled', // 'disabled', 'all', 'selected'
    selectedMeshes: []
});

// 模型信息
const modelInfo = reactive({
    meshCount: 0,
    materialCount: 0,
    vertexCount: 0,
    fileSize: '0 KB'
});

const availableMeshes = ref([]);
const currentInteractiveCount = ref(0);
const performanceWarning = ref('');

let scene = null;
let currentModel = ref(null);
let gridHelper = null;

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { ModelLoader, GridHelper } from '@w3d/components';
import * as THREE from 'three';

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

// 启用阴影和自动调整大小
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// 注册组件
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格辅助
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20,
  color: '#888888'
});

// ===== 模型加载配置 =====

// 1. 基础模型加载
const model = await scene.add('ModelLoader', {
  name: 'building',
  url: './models/ShaderBall.glb',

  // 交互事件配置 (interactiveMeshes)
  // false (默认) - 禁用所有事件，最佳性能
  // '*' - 启用所有 Mesh 事件，性能影响较大
  // 数组 - 仅对指定名称的 Mesh 启用事件（推荐）
  interactiveMeshes: false,

  // 模型变换
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1]
});

// 2. 选择性启用事件（推荐）
const interactiveModel = await scene.add('ModelLoader', {
  name: 'interactive-building',
  url: '/models/ShaderBall.glb',
  interactiveMeshes: ['行政大楼', '办公楼A', '停车场']
});

// 3. 动态修改交互配置
// 启用指定 Mesh 的事件
model.setInteractiveMeshes(['建筑物A', '建筑物B']);

// 启用所有 Mesh 的事件（谨慎使用）
model.setInteractiveMeshes('*');

// 禁用所有事件
model.setInteractiveMeshes(false);

// ===== 模型变换控制 =====

// 位置变换
model.setPosition(x, y, z);
model.position.set(x, y, z);

// 旋转变换（弧度）
model.setRotation(rx, ry, rz);
model.rotation.set(rx, ry, rz);

// 缩放变换
model.setScale(sx, sy, sz);
model.scale.set(sx, sy, sz);

// ===== 模型信息获取 =====

// 获取模型中的所有 Mesh
const meshes = model.getMeshes();
console.log('Mesh 数量:', meshes.length);

// 获取可交互的对象
const interactiveObjects = model.getInteractiveObjects();
console.log('可交互对象数量:', interactiveObjects.length);

// 检查 Mesh 是否可交互
const isInteractive = model.isMeshInteractive(someMesh);

// ===== 事件监听 =====

// 监听模型加载完成
model.addEventListener('loaded', (event) => {
  console.log('模型加载完成:', event.detail);
});

// 监听 Mesh 点击事件
model.addEventListener('click', (event) => {
  console.log('点击了 Mesh:', event.detail.object.name);
});

// 监听 Mesh 鼠标移入事件
model.addEventListener('mouseenter', (event) => {
  console.log('鼠标移入 Mesh:', event.detail.object.name);
});

// 启动渲染
scene.start();`;
onMounted(() => {
    initScene();
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

        loadingProgress.value = 30;
        loadingText.value = '初始化渲染器...';

        // 初始化场景
        scene.init();

        // 启用阴影和自动调整大小
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 50;
        loadingText.value = '设置灯光...';

        // 添加基础灯光
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.6
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [10, 10, 5],
            castShadow: true
        });

        loadingProgress.value = 70;
        loadingText.value = '添加场景对象...';

        // 注册组件
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('GridHelper', GridHelper);

        // 添加网格辅助
        gridHelper = await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20,
            color: '#888888'
        });

        loadingProgress.value = 100;
        loadingText.value = '完成';

        // 启动渲染
        scene.start();

        // 延迟隐藏加载状态
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('Scene initialization failed:', error);
        loadingText.value = '初始化失败';
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
};

// 加载模型
const loadModel = async () => {
    if (!scene || !modelConfig.url) return;

    try {
        isLoading.value = true;
        loadingText.value = '加载模型...';
        loadingProgress.value = 0;

        // 清除现有模型
        if (currentModel.value) {
            scene.remove(currentModel.value.name);
            currentModel.value = null;
        }

        // 加载新模型
        currentModel.value = await scene.add('ModelLoader', {
            name: 'loaded-model',
            url: modelConfig.url,
            interactiveMeshes: false
        });

        // 更新模型信息
        updateModelInfo();

        // 重置变换
        resetTransform();

        loadingProgress.value = 100;
        loadingText.value = '模型加载完成';

        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('Model loading failed:', error);
        loadingText.value = '模型加载失败';
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
};

// 清除模型
const clearModel = () => {
    if (currentModel.value && scene) {
        scene.remove(currentModel.value.name);
        currentModel.value = null;
        availableMeshes.value = [];
        interactionConfig.selectedMeshes = [];
        currentInteractiveCount.value = 0;
        performanceWarning.value = '';

        // 重置模型信息
        modelInfo.meshCount = 0;
        modelInfo.materialCount = 0;
        modelInfo.vertexCount = 0;
        modelInfo.fileSize = '0 KB';
    }
};

// 更新模型变换
const updateModelTransform = () => {
    if (!currentModel.value) return;

    // 位置
    currentModel.value.position.set(
        modelTransform.position.x,
        modelTransform.position.y,
        modelTransform.position.z
    );

    // 旋转（度转弧度）
    currentModel.value.rotation.set(
        (modelTransform.rotation.x * Math.PI) / 180,
        (modelTransform.rotation.y * Math.PI) / 180,
        (modelTransform.rotation.z * Math.PI) / 180
    );

    // 缩放
    if (modelTransform.scale.lockAspect) {
        const scale = modelTransform.scale.uniform;
        currentModel.value.scale.set(scale, scale, scale);
    }
};
// 更新统一缩放
const updateUniformScale = () => {
    if (modelTransform.scale.lockAspect) {
        updateModelTransform();
    }
};

// 更新交互模式
const updateInteractionMode = () => {
    if (!currentModel.value) return;

    let interactiveMeshes;

    switch (interactionConfig.mode) {
        case 'disabled':
            interactiveMeshes = false;
            break;
        case 'all':
            interactiveMeshes = '*';
            break;
        case 'selected':
            interactiveMeshes = interactionConfig.selectedMeshes;
            break;
        default:
            interactiveMeshes = false;
    }

    // 应用交互配置
    currentModel.value.setInteractiveMeshes(interactiveMeshes);

    // 更新状态
    updateInteractionStatus();
};

// 更新交互状态
const updateInteractionStatus = () => {
    if (!currentModel.value) return;

    const interactiveObjects = currentModel.value.getInteractiveObjects();
    currentInteractiveCount.value = interactiveObjects.length;

    // 性能警告
    if (interactionConfig.mode === 'all' && availableMeshes.value.length > 50) {
        performanceWarning.value = `启用了 ${availableMeshes.value.length} 个 Mesh 的事件，可能影响性能`;
    } else {
        performanceWarning.value = '';
    }
};

// 更新模型信息
const updateModelInfo = () => {
    if (!currentModel.value) return;

    try {
        // 获取所有 Mesh
        const meshes = currentModel.value.getMeshes ? currentModel.value.getMeshes() : [];
        availableMeshes.value = meshes.map((mesh) => ({
            name: mesh.name || 'Unnamed Mesh',
            uuid: mesh.uuid
        }));

        // 统计信息
        modelInfo.meshCount = meshes.length;

        // 统计材质数量
        const materials = new Set();
        let vertexCount = 0;

        meshes.forEach((mesh) => {
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat) => materials.add(mat.uuid));
                } else {
                    materials.add(mesh.material.uuid);
                }
            }

            if (mesh.geometry && mesh.geometry.attributes.position) {
                vertexCount += mesh.geometry.attributes.position.count;
            }
        });

        modelInfo.materialCount = materials.size;
        modelInfo.vertexCount = vertexCount;

        // 文件大小（模拟）
        modelInfo.fileSize = `${Math.round(vertexCount / 1000)}KB`;
    } catch (error) {
        console.error('Failed to update model info:', error);
    }
};

// 重置变换
const resetTransform = () => {
    modelTransform.position.x = 0;
    modelTransform.position.y = 0;
    modelTransform.position.z = 0;
    modelTransform.rotation.x = 0;
    modelTransform.rotation.y = 0;
    modelTransform.rotation.z = 0;
    modelTransform.scale.uniform = 1;

    updateModelTransform();
};

// 清理资源
const cleanup = () => {
    console.log('Cleaning up Model Loader example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    currentModel.value = null;
    gridHelper = null;
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

/* 场景容器 */
.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    overflow: hidden;
}

/* 位置网格布局 */
.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 15px;
}

/* Mesh 列表 */
.mesh-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
}

.mesh-item {
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
}

/* 警告信息 */
.warning {
    padding: 10px;
    background: rgba(255, 165, 0, 0.1);
    border-left: 3px solid #ffa500;
    border-radius: 4px;
    color: #ffa500;
    font-size: 12px;
    margin-top: 10px;
    min-width: 40px;
    text-align: right;
}

.setting-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
}

.setting-group input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #00ff88;
}

.setting-group select {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
}

/* 交互控制 */
.interaction-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.mesh-selection {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mesh-list {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 8px;
}

.mesh-item {
    padding: 4px 0;
}

.mesh-item label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    font-size: 12px;
    cursor: pointer;
}

.interaction-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    font-size: 12px;
}

.info-value {
    color: #00ff88;
    font-weight: 500;
}

.warning {
    color: #ff6b6b;
    font-size: 12px;
    padding: 8px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 6px;
}

/* 模型信息 */
.model-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.mesh-list::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.mesh-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.mesh-list::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.mesh-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.7);
}

/* 动画 */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

