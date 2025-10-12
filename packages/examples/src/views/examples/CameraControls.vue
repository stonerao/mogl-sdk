<template>
    <SplitLayout :code="sourceCode" language="javascript" title="02 - Camera Controls">
        <div class="scene-container" ref="sceneContainer">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">{{ loadingText }}</div>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{ width: loadingProgress + '%' }"
                            ></div>
                        </div>
                        <span class="progress-text">{{ loadingProgress }}%</span>
                    </div>
                </div>
            </div>

            <!-- 控制面板 -->
            <div class="control-panel">
                <!-- 相机位置控制 -->
                <div class="control-section">
                    <h4>相机位置</h4>
                    <div class="position-controls">
                        <div class="input-group">
                            <label>X</label>
                            <input
                                type="number"
                                v-model.number="cameraPosition.x"
                                @input="updateCameraPosition"
                                step="1"
                            />
                        </div>
                        <div class="input-group">
                            <label>Y</label>
                            <input
                                type="number"
                                v-model.number="cameraPosition.y"
                                @input="updateCameraPosition"
                                step="1"
                            />
                        </div>
                        <div class="input-group">
                            <label>Z</label>
                            <input
                                type="number"
                                v-model.number="cameraPosition.z"
                                @input="updateCameraPosition"
                                step="1"
                            />
                        </div>
                    </div>
                </div>

                <!-- 相机参数 -->
                <div class="control-section">
                    <h4>相机参数</h4>
                    <div class="camera-params">
                        <div class="param-group">
                            <label>视野角度 (FOV)</label>
                            <input
                                type="range"
                                v-model.number="cameraParams.fov"
                                @input="updateCameraParams"
                                min="10"
                                max="120"
                                step="1"
                            />
                            <span>{{ cameraParams.fov }}°</span>
                        </div>
                        <div class="param-group">
                            <label>近裁剪面</label>
                            <input
                                type="range"
                                v-model.number="cameraParams.near"
                                @input="updateCameraParams"
                                min="0.1"
                                max="10"
                                step="0.1"
                            />
                            <span>{{ cameraParams.near }}</span>
                        </div>
                        <div class="param-group">
                            <label>远裁剪面</label>
                            <input
                                type="range"
                                v-model.number="cameraParams.far"
                                @input="updateCameraParams"
                                min="100"
                                max="10000"
                                step="100"
                            />
                            <span>{{ cameraParams.far }}</span>
                        </div>
                    </div>
                </div>

                <!-- 控制器设置 -->
                <div class="control-section">
                    <h4>控制器设置</h4>
                    <div class="controls-settings">
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="controlsSettings.enableDamping"
                                    @change="updateControlsSettings"
                                />
                                启用阻尼
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>阻尼系数</label>
                            <input
                                type="range"
                                v-model.number="controlsSettings.dampingFactor"
                                @input="updateControlsSettings"
                                min="0.01"
                                max="0.2"
                                step="0.01"
                                :disabled="!controlsSettings.enableDamping"
                            />
                            <span>{{ controlsSettings.dampingFactor }}</span>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="controlsSettings.autoRotate"
                                    @change="updateControlsSettings"
                                />
                                自动旋转
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>旋转速度</label>
                            <input
                                type="range"
                                v-model.number="controlsSettings.autoRotateSpeed"
                                @input="updateControlsSettings"
                                min="0.5"
                                max="10"
                                step="0.5"
                                :disabled="!controlsSettings.autoRotate"
                            />
                            <span>{{ controlsSettings.autoRotateSpeed }}</span>
                        </div>
                    </div>
                </div>

                <!-- 距离限制 -->
                <div class="control-section">
                    <h4>距离限制</h4>
                    <div class="distance-controls">
                        <div class="param-group">
                            <label>最小距离</label>
                            <input
                                type="range"
                                v-model.number="controlsSettings.minDistance"
                                @input="updateControlsSettings"
                                min="1"
                                max="50"
                                step="1"
                            />
                            <span>{{ controlsSettings.minDistance }}</span>
                        </div>
                        <div class="param-group">
                            <label>最大距离</label>
                            <input
                                type="range"
                                v-model.number="controlsSettings.maxDistance"
                                @input="updateControlsSettings"
                                min="100"
                                max="2000"
                                step="50"
                            />
                            <span>{{ controlsSettings.maxDistance }}</span>
                        </div>
                    </div>
                </div>

                <!-- 预设位置 -->
                <div class="control-section">
                    <h4>预设位置</h4>
                    <div class="preset-buttons">
                        <button @click="setCameraPreset('front')" class="preset-btn">正面</button>
                        <button @click="setCameraPreset('back')" class="preset-btn">背面</button>
                        <button @click="setCameraPreset('left')" class="preset-btn">左侧</button>
                        <button @click="setCameraPreset('right')" class="preset-btn">右侧</button>
                        <button @click="setCameraPreset('top')" class="preset-btn">顶部</button>
                        <button @click="setCameraPreset('bottom')" class="preset-btn">底部</button>
                        <button @click="resetCamera" class="reset-btn">重置</button>
                    </div>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import * as THREE from 'three';

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('');
const loadingProgress = ref(0);

// 相机位置状态
const cameraPosition = reactive({
    x: 5,
    y: 5,
    z: 5
});

// 相机参数状态
const cameraParams = reactive({
    fov: 45,
    near: 0.1,
    far: 1000
});

// 控制器设置状态
const controlsSettings = reactive({
    enableDamping: true,
    dampingFactor: 0.05,
    autoRotate: false,
    autoRotateSpeed: 2.0,
    minDistance: 5,
    maxDistance: 500
});

let scene = null;
let gridHelper = null;
let cube = null;

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import * as THREE from 'three';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [5, 5, 5],
    lookAt: [0, 0, 0],
    near: 0.1,
    far: 1000
  }
});

// 初始化场景
scene.init();

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

// 启用阴影和自动调整大小
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// 注册组件
scene.registerComponent('GridHelper', GridHelper);

// 添加网格辅助
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20,
  color: '#888888'
});

// ===== 相机控制配置 =====

// 1. 相机位置控制
scene.camera.setPosition(5, 5, 5);
scene.camera.lookAt(0, 0, 0);

// 2. 相机参数调整
scene.camera.instance.fov = 45;
scene.camera.instance.near = 0.1;
scene.camera.instance.far = 1000;
scene.camera.instance.updateProjectionMatrix();

// 3. 轨道控制器配置
const controls = scene.controls.instance;

// 启用阻尼（平滑移动）
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 自动旋转
controls.autoRotate = false;
controls.autoRotateSpeed = 2.0;

// 距离限制
controls.minDistance = 5;
controls.maxDistance = 500;

// 启用/禁用控制
controls.enableZoom = true;    // 缩放
controls.enableRotate = true;  // 旋转
controls.enablePan = true;     // 平移

// ===== 预设相机位置 =====

// 正面视图
function setFrontView() {
  scene.camera.setPosition(0, 0, 20);
  scene.camera.lookAt(0, 0, 0);
}

// 顶部视图
function setTopView() {
  scene.camera.setPosition(0, 20, 0);
  scene.camera.lookAt(0, 0, 0);
}

// 侧面视图
function setSideView() {
  scene.camera.setPosition(20, 0, 0);
  scene.camera.lookAt(0, 0, 0);
}

// 重置相机
function resetCamera() {
  controls.reset();
}

// ===== 动态调整示例 =====

// 动态修改相机位置
// scene.camera.setPosition(x, y, z);

// 动态修改控制器设置
// controls.enableDamping = true;
// controls.dampingFactor = 0.1;
// controls.autoRotate = true;

// 动态修改相机参数
// scene.camera.instance.fov = 60;
// scene.camera.instance.updateProjectionMatrix();

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
                fov: cameraParams.fov,
                position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
                lookAt: [0, 0, 0],
                near: cameraParams.near,
                far: cameraParams.far
            }
        });

        loadingProgress.value = 30;
        loadingText.value = '初始化渲染器...';

        // 初始化场景
        scene.init();

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
        loadingText.value = '配置控制器...';

        // 配置控制器
        applyControlsSettings();

        // 启用阴影和自动调整大小
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 80;
        loadingText.value = '添加场景对象...';

        // 注册组件
        scene.registerComponent('GridHelper', GridHelper);

        // 添加网格辅助
        gridHelper = await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20,
            color: '#888888'
        });

        // 添加一个立方体作为参考对象
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ color: '#00ff88' });
        cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 1, 0);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.scene.add(cube);

        loadingProgress.value = 100;
        loadingText.value = '完成';

        // 启动渲染
        scene.start();

        // 确保相机位置设置正确
        updateCameraPosition();

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

// 应用控制器设置
const applyControlsSettings = () => {
    if (!scene || !scene.controls) return;

    const controls = scene.controls.instance;
    controls.enableDamping = controlsSettings.enableDamping;
    controls.dampingFactor = controlsSettings.dampingFactor;
    controls.autoRotate = controlsSettings.autoRotate;
    controls.autoRotateSpeed = controlsSettings.autoRotateSpeed;
    controls.minDistance = controlsSettings.minDistance;
    controls.maxDistance = controlsSettings.maxDistance;
};

// 更新相机位置
const updateCameraPosition = () => {
    if (!scene || !scene.camera) return;
    scene.camera.setPosition(cameraPosition.x, cameraPosition.y, cameraPosition.z);
};

// 更新相机参数
const updateCameraParams = () => {
    if (!scene || !scene.camera) return;

    const camera = scene.camera.instance;
    camera.fov = cameraParams.fov;
    camera.near = cameraParams.near;
    camera.far = cameraParams.far;
    camera.updateProjectionMatrix();
};

// 更新控制器设置
const updateControlsSettings = () => {
    applyControlsSettings();
};

// 设置预设相机位置
const setCameraPreset = (preset) => {
    if (!scene || !scene.camera) return;

    const presets = {
        front: { position: [0, 0, 20], lookAt: [0, 0, 0] },
        back: { position: [0, 0, -20], lookAt: [0, 0, 0] },
        left: { position: [-20, 0, 0], lookAt: [0, 0, 0] },
        right: { position: [20, 0, 0], lookAt: [0, 0, 0] },
        top: { position: [0, 20, 0], lookAt: [0, 0, 0] },
        bottom: { position: [0, -20, 0], lookAt: [0, 0, 0] }
    };

    const config = presets[preset];
    if (config) {
        const [x, y, z] = config.position;
        const [lx, ly, lz] = config.lookAt;

        scene.camera.setPosition(x, y, z);
        scene.camera.lookAt(lx, ly, lz);

        // 更新响应式数据
        cameraPosition.x = x;
        cameraPosition.y = y;
        cameraPosition.z = z;
    }
};

// 重置相机
const resetCamera = () => {
    if (!scene || !scene.controls) return;
    scene.controls.instance.reset();

    // 重置响应式数据到默认位置
    cameraPosition.x = 5;
    cameraPosition.y = 5;
    cameraPosition.z = 5;

    // 更新相机位置
    updateCameraPosition();
};

// 清理资源
const cleanup = () => {
    console.log('Cleaning up Camera Controls example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    gridHelper = null;
    cube = null;
};
</script>

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-content {
    text-align: center;
    color: white;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #00ff88;
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
    color: #00ff88;
}

.loading-progress {
    display: flex;
    align-items: center;
    gap: 10px;
}

.progress-bar {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ff88, #00ccff);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    min-width: 35px;
}

.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 300px;
    max-height: calc(100vh - 40px);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 20px;
    color: white;
    overflow-y: auto;
    z-index: 100;
}

.control-section {
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.control-section h4 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #00ff88;
    font-weight: 500;
}

.position-controls {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.input-group label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.input-group input[type='number'] {
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 13px;
    text-align: center;
}

.input-group input[type='number']:focus {
    outline: none;
    border-color: #00ff88;
}

.param-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
}

.param-group label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

.param-group input[type='range'] {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
}

.param-group input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #00ff88;
    border-radius: 50%;
    cursor: pointer;
}

.param-group input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #00ff88;
    border-radius: 50%;
    cursor: pointer;
    border: none;
}

.param-group span {
    font-size: 12px;
    color: #00ccff;
    font-weight: 500;
    text-align: right;
}

.setting-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.setting-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
}

.setting-group input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #00ff88;
}

.preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.preset-btn,
.reset-btn {
    padding: 8px 12px;
    background: linear-gradient(135deg, #00ff88, #00ccff);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.preset-btn:hover,
.reset-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.reset-btn {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.reset-btn:hover {
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}
</style>

