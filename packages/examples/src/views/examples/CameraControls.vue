<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="02 - Camera Controls"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <GuiLoading
                :visible="isLoading"
                :text="loadingText"
                :showProgress="true"
                :progress="loadingProgress"
            />

            <GuiPanel title="相机控制">
                <GuiSection title="相机位置">
                    <div class="position-controls">
                        <GuiNumberInput
                            label="X"
                            v-model="cameraPosition.x"
                            @change="updateCameraPosition"
                            :step="1"
                        />
                        <GuiNumberInput
                            label="Y"
                            v-model="cameraPosition.y"
                            @change="updateCameraPosition"
                            :step="1"
                        />
                        <GuiNumberInput
                            label="Z"
                            v-model="cameraPosition.z"
                            @change="updateCameraPosition"
                            :step="1"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="相机参数">
                    <GuiSlider
                        label="视野角度 (FOV)"
                        v-model="cameraParams.fov"
                        :min="10"
                        :max="120"
                        :step="1"
                        suffix="°"
                        @change="updateCameraParams"
                    />
                    <GuiSlider
                        label="近裁剪面"
                        v-model="cameraParams.near"
                        :min="0.1"
                        :max="10"
                        :step="0.1"
                        :precision="1"
                        @change="updateCameraParams"
                    />
                    <GuiSlider
                        label="远裁剪面"
                        v-model="cameraParams.far"
                        :min="100"
                        :max="10000"
                        :step="100"
                        :precision="0"
                        @change="updateCameraParams"
                    />
                </GuiSection>

                <GuiSection title="控制器设置">
                    <GuiCheckbox
                        label="启用阻尼"
                        v-model="controlsSettings.enableDamping"
                        @change="updateControlsSettings"
                    />
                    <GuiSlider
                        label="阻尼系数"
                        v-model="controlsSettings.dampingFactor"
                        :min="0.01"
                        :max="0.2"
                        :step="0.01"
                        :precision="2"
                        @change="updateControlsSettings"
                        :disabled="!controlsSettings.enableDamping"
                    />
                    <GuiCheckbox
                        label="自动旋转"
                        v-model="controlsSettings.autoRotate"
                        @change="updateControlsSettings"
                    />
                    <GuiSlider
                        label="旋转速度"
                        v-model="controlsSettings.autoRotateSpeed"
                        :min="0.5"
                        :max="10"
                        :step="0.5"
                        :precision="1"
                        @change="updateControlsSettings"
                        :disabled="!controlsSettings.autoRotate"
                    />
                </GuiSection>

                <GuiSection title="距离限制">
                    <GuiSlider
                        label="最小距离"
                        v-model="controlsSettings.minDistance"
                        :min="1"
                        :max="50"
                        :step="1"
                        @change="updateControlsSettings"
                    />
                    <GuiSlider
                        label="最大距离"
                        v-model="controlsSettings.maxDistance"
                        :min="100"
                        :max="2000"
                        :step="50"
                        @change="updateControlsSettings"
                    />
                </GuiSection>

                <GuiSection title="预设位置">
                    <div class="preset-buttons">
                        <GuiButton label="正面" size="small" @click="setCameraPreset('front')" />
                        <GuiButton label="背面" size="small" @click="setCameraPreset('back')" />
                        <GuiButton label="左侧" size="small" @click="setCameraPreset('left')" />
                        <GuiButton label="右侧" size="small" @click="setCameraPreset('right')" />
                        <GuiButton label="顶部" size="small" @click="setCameraPreset('top')" />
                        <GuiButton label="底部" size="small" @click="setCameraPreset('bottom')" />
                    </div>
                    <GuiButton label="重置" variant="secondary" block @click="resetCamera" />
                </GuiSection>
            </GuiPanel>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiCheckbox,
    GuiButton,
    GuiLoading,
    GuiNumberInput
} from '@/components/Gui';
import * as THREE from 'three';
import { useSceneOnly } from '../../composables/useSceneOnly';

// 检测是否为 sceneOnly 模式
const isSceneOnly = useSceneOnly();

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

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.position-controls {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}

.preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
}
</style>

