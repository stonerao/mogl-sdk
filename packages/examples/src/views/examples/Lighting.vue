<template>
    <SplitLayout :code="sourceCode" language="javascript" title="03 - Lighting">
        <div class="scene-container" ref="sceneContainer">
            <!-- 加载状态 -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- 控制面板 -->
            <template v-if="!isLoading">
                <GuiPanel title="灯光控制" width="wide">
                    <!-- 环境光控制 -->
                    <GuiSection title="环境光 (Ambient Light)">
                        <GuiCheckbox
                            label="启用环境光"
                            v-model="ambientLight.enabled"
                            @update:modelValue="updateAmbientLight"
                        />
                        <template v-if="ambientLight.enabled">
                            <GuiSlider
                                label="强度"
                                v-model="ambientLight.intensity"
                                :min="0"
                                :max="2"
                                :step="0.1"
                                @update:modelValue="updateAmbientLight"
                            />
                            <GuiColorPicker
                                label="颜色"
                                v-model="ambientLight.color"
                                @update:modelValue="updateAmbientLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- 平行光控制 -->
                    <GuiSection title="平行光 (Directional Light)">
                        <GuiCheckbox
                            label="启用平行光"
                            v-model="directionalLight.enabled"
                            @update:modelValue="updateDirectionalLight"
                        />
                        <template v-if="directionalLight.enabled">
                            <GuiSlider
                                label="强度"
                                v-model="directionalLight.intensity"
                                :min="0"
                                :max="3"
                                :step="0.1"
                                @update:modelValue="updateDirectionalLight"
                            />
                            <GuiColorPicker
                                label="颜色"
                                v-model="directionalLight.color"
                                @update:modelValue="updateDirectionalLight"
                            />
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="位置 X"
                                    v-model="directionalLight.position.x"
                                    :step="1"
                                    @update:modelValue="updateDirectionalLight"
                                />
                                <GuiNumberInput
                                    label="位置 Y"
                                    v-model="directionalLight.position.y"
                                    :step="1"
                                    @update:modelValue="updateDirectionalLight"
                                />
                                <GuiNumberInput
                                    label="位置 Z"
                                    v-model="directionalLight.position.z"
                                    :step="1"
                                    @update:modelValue="updateDirectionalLight"
                                />
                            </div>
                            <GuiCheckbox
                                label="投射阴影"
                                v-model="directionalLight.castShadow"
                                @update:modelValue="updateDirectionalLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- 点光源控制 -->
                    <GuiSection title="点光源 (Point Light)">
                        <GuiCheckbox
                            label="启用点光源"
                            v-model="pointLight.enabled"
                            @update:modelValue="updatePointLight"
                        />
                        <template v-if="pointLight.enabled">
                            <GuiSlider
                                label="强度"
                                v-model="pointLight.intensity"
                                :min="0"
                                :max="5"
                                :step="0.1"
                                @update:modelValue="updatePointLight"
                            />
                            <GuiColorPicker
                                label="颜色"
                                v-model="pointLight.color"
                                @update:modelValue="updatePointLight"
                            />
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="位置 X"
                                    v-model="pointLight.position.x"
                                    :step="1"
                                    @update:modelValue="updatePointLight"
                                />
                                <GuiNumberInput
                                    label="位置 Y"
                                    v-model="pointLight.position.y"
                                    :step="1"
                                    @update:modelValue="updatePointLight"
                                />
                                <GuiNumberInput
                                    label="位置 Z"
                                    v-model="pointLight.position.z"
                                    :step="1"
                                    @update:modelValue="updatePointLight"
                                />
                            </div>
                            <GuiSlider
                                label="距离"
                                v-model="pointLight.distance"
                                :min="0"
                                :max="100"
                                :step="1"
                                @update:modelValue="updatePointLight"
                            />
                            <GuiSlider
                                label="衰减"
                                v-model="pointLight.decay"
                                :min="0"
                                :max="5"
                                :step="0.1"
                                @update:modelValue="updatePointLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- 聚光灯控制 -->
                    <GuiSection title="聚光灯 (Spot Light)">
                        <GuiCheckbox
                            label="启用聚光灯"
                            v-model="spotLight.enabled"
                            @update:modelValue="updateSpotLight"
                        />
                        <template v-if="spotLight.enabled">
                            <GuiSlider
                                label="强度"
                                v-model="spotLight.intensity"
                                :min="0"
                                :max="5"
                                :step="0.1"
                                @update:modelValue="updateSpotLight"
                            />
                            <GuiColorPicker
                                label="颜色"
                                v-model="spotLight.color"
                                @update:modelValue="updateSpotLight"
                            />
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="位置 X"
                                    v-model="spotLight.position.x"
                                    :step="1"
                                    @update:modelValue="updateSpotLight"
                                />
                                <GuiNumberInput
                                    label="位置 Y"
                                    v-model="spotLight.position.y"
                                    :step="1"
                                    @update:modelValue="updateSpotLight"
                                />
                                <GuiNumberInput
                                    label="位置 Z"
                                    v-model="spotLight.position.z"
                                    :step="1"
                                    @update:modelValue="updateSpotLight"
                                />
                            </div>
                            <GuiSlider
                                label="角度"
                                v-model="spotLight.angle"
                                :min="0.1"
                                :max="1.57"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateSpotLight"
                            />
                            <GuiSlider
                                label="边缘模糊"
                                v-model="spotLight.penumbra"
                                :min="0"
                                :max="1"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateSpotLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- 预设配置 -->
                    <GuiSection title="预设配置">
                        <div class="preset-buttons">
                            <GuiButton label="日光" @click="setLightingPreset('daylight')" />
                            <GuiButton label="夕阳" @click="setLightingPreset('sunset')" />
                            <GuiButton label="夜晚" @click="setLightingPreset('night')" />
                            <GuiButton label="工作室" @click="setLightingPreset('studio')" />
                            <GuiButton label="重置" variant="secondary" @click="resetLighting" />
                        </div>
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiLoading,
    GuiCheckbox,
    GuiSlider,
    GuiColorPicker,
    GuiNumberInput,
    GuiButton
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import * as THREE from 'three';

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('');
const loadingProgress = ref(0);

// 环境光状态
const ambientLight = reactive({
    enabled: true,
    intensity: 0.4,
    color: '#ffffff'
});

// 平行光状态
const directionalLight = reactive({
    enabled: true,
    intensity: 1.0,
    color: '#ffffff',
    position: { x: 10, y: 10, z: 5 },
    castShadow: true
});

// 点光源状态
const pointLight = reactive({
    enabled: false,
    intensity: 1.0,
    color: '#ff6b6b',
    position: { x: 5, y: 8, z: 5 },
    distance: 20,
    decay: 2
});

// 聚光灯状态
const spotLight = reactive({
    enabled: false,
    intensity: 1.0,
    color: '#4ecdc4',
    position: { x: -5, y: 10, z: 5 },
    angle: Math.PI / 6,
    penumbra: 0.1
});

let scene = null;
let gridHelper = null;
let sphere = null;
let plane = null;
let cube = null;

// 灯光实例引用
let ambientLightInstance = null;
let directionalLightInstance = null;
let pointLightInstance = null;
let spotLightInstance = null;

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
scene.registerComponent('GridHelper', GridHelper);

// 添加网格辅助
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20,
  color: '#888888'
});

// ===== 灯光系统配置 =====

// 1. 环境光 (Ambient Light)
// 提供场景的基础照明，无方向性
const ambientLight = scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.4
});

// 2. 平行光 (Directional Light)
// 模拟太阳光，有方向但无位置衰减
const directionalLight = scene.light.addDirectional({
  color: '#ffffff',
  intensity: 1.0,
  position: [10, 10, 5],
  castShadow: true,
  shadowMapSize: 2048
});

// 3. 点光源 (Point Light)
// 从一个点向四周发射光线，有位置和距离衰减
const pointLight = scene.light.addPoint({
  color: '#ff6b6b',
  intensity: 1.0,
  position: [5, 8, 5],
  distance: 20,  // 光照距离
  decay: 2       // 衰减系数
});

// 4. 聚光灯 (Spot Light)
// 锥形光束，有位置、方向和角度
const spotLight = scene.light.addSpot({
  color: '#4ecdc4',
  intensity: 1.0,
  position: [-5, 10, 5],
  target: [0, 0, 0],
  angle: Math.PI / 6,    // 光锥角度
  penumbra: 0.1,         // 边缘模糊度
  distance: 30,
  decay: 2
});

// ===== 动态控制灯光 =====

// 启用/禁用灯光
// ambientLight.visible = true/false;
// directionalLight.visible = true/false;

// 调整灯光属性
// ambientLight.intensity = 0.5;
// directionalLight.color.setHex(0xffffff);
// pointLight.position.set(x, y, z);

// 动画灯光（例如：点光源移动）
// function animatePointLight() {
//   const time = Date.now() * 0.001;
//   pointLight.position.x = Math.cos(time) * 10;
//   pointLight.position.z = Math.sin(time) * 10;
// }

// ===== 预设灯光配置 =====

// 日光模式
function setDaylightMode() {
  scene.light.removeAll();
  scene.light.addAmbient({ color: '#87CEEB', intensity: 0.6 });
  scene.light.addDirectional({
    color: '#FFF8DC',
    intensity: 1.2,
    position: [10, 20, 10],
    castShadow: true
  });
}

// 夜晚模式
function setNightMode() {
  scene.light.removeAll();
  scene.light.addAmbient({ color: '#191970', intensity: 0.2 });
  scene.light.addPoint({
    color: '#FFD700',
    intensity: 2.0,
    position: [0, 10, 0],
    distance: 25
  });
}

// 工作室模式
function setStudioMode() {
  scene.light.removeAll();
  scene.light.addAmbient({ color: '#ffffff', intensity: 0.3 });

  // 主光源
  scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [10, 10, 10],
    castShadow: true
  });

  // 补光
  scene.light.addDirectional({
    color: '#ffffff',
    intensity: 0.5,
    position: [-10, 5, -5]
  });
}

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

        // 初始化灯光
        initLights();

        loadingProgress.value = 70;
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

        // 添加演示对象
        createDemoObjects();

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

// 初始化灯光
const initLights = () => {
    // 环境光
    if (ambientLight.enabled) {
        ambientLightInstance = scene.light.addAmbient({
            color: ambientLight.color,
            intensity: ambientLight.intensity
        });
    }

    // 平行光
    if (directionalLight.enabled) {
        directionalLightInstance = scene.light.addDirectional({
            color: directionalLight.color,
            intensity: directionalLight.intensity,
            position: [
                directionalLight.position.x,
                directionalLight.position.y,
                directionalLight.position.z
            ],
            castShadow: directionalLight.castShadow,
            shadowMapSize: 2048
        });
    }

    // 点光源
    if (pointLight.enabled) {
        pointLightInstance = scene.light.addPoint({
            color: pointLight.color,
            intensity: pointLight.intensity,
            position: [pointLight.position.x, pointLight.position.y, pointLight.position.z],
            distance: pointLight.distance,
            decay: pointLight.decay
        });
    }

    // 聚光灯
    if (spotLight.enabled) {
        spotLightInstance = scene.light.addSpot({
            color: spotLight.color,
            intensity: spotLight.intensity,
            position: [spotLight.position.x, spotLight.position.y, spotLight.position.z],
            target: [0, 0, 0],
            angle: spotLight.angle,
            penumbra: spotLight.penumbra,
            distance: 30,
            decay: 2
        });
    }
};

// 创建演示对象
const createDemoObjects = () => {
    // 地面平面
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({ color: '#cccccc' });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.scene.add(plane);

    // 球体
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: '#ff6b6b' });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-3, 1.5, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.scene.add(sphere);

    // 立方体
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: '#4ecdc4' });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(3, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.scene.add(cube);
};
// 更新环境光
const updateAmbientLight = () => {
    if (!scene) return;

    if (ambientLight.enabled) {
        if (!ambientLightInstance) {
            ambientLightInstance = scene.light.addAmbient({
                color: ambientLight.color,
                intensity: ambientLight.intensity
            });
        } else {
            ambientLightInstance.color.setHex(ambientLight.color.replace('#', '0x'));
            ambientLightInstance.intensity = ambientLight.intensity;
        }
    } else {
        if (ambientLightInstance) {
            scene.scene.remove(ambientLightInstance);
            ambientLightInstance = null;
        }
    }
};

// 更新平行光
const updateDirectionalLight = () => {
    if (!scene) return;

    if (directionalLight.enabled) {
        if (!directionalLightInstance) {
            directionalLightInstance = scene.light.addDirectional({
                color: directionalLight.color,
                intensity: directionalLight.intensity,
                position: [
                    directionalLight.position.x,
                    directionalLight.position.y,
                    directionalLight.position.z
                ],
                castShadow: directionalLight.castShadow,
                shadowMapSize: 2048
            });
        } else {
            directionalLightInstance.color.setHex(directionalLight.color.replace('#', '0x'));
            directionalLightInstance.intensity = directionalLight.intensity;
            directionalLightInstance.position.set(
                directionalLight.position.x,
                directionalLight.position.y,
                directionalLight.position.z
            );
            directionalLightInstance.castShadow = directionalLight.castShadow;
        }
    } else {
        if (directionalLightInstance) {
            scene.scene.remove(directionalLightInstance);
            directionalLightInstance = null;
        }
    }
};

// 更新点光源
const updatePointLight = () => {
    if (!scene) return;

    if (pointLight.enabled) {
        if (!pointLightInstance) {
            pointLightInstance = scene.light.addPoint({
                color: pointLight.color,
                intensity: pointLight.intensity,
                position: [pointLight.position.x, pointLight.position.y, pointLight.position.z],
                distance: pointLight.distance,
                decay: pointLight.decay
            });
        } else {
            pointLightInstance.color.setHex(pointLight.color.replace('#', '0x'));
            pointLightInstance.intensity = pointLight.intensity;
            pointLightInstance.position.set(
                pointLight.position.x,
                pointLight.position.y,
                pointLight.position.z
            );
            pointLightInstance.distance = pointLight.distance;
            pointLightInstance.decay = pointLight.decay;
        }
    } else {
        if (pointLightInstance) {
            scene.scene.remove(pointLightInstance);
            pointLightInstance = null;
        }
    }
};

// 更新聚光灯
const updateSpotLight = () => {
    if (!scene) return;

    if (spotLight.enabled) {
        if (!spotLightInstance) {
            spotLightInstance = scene.light.addSpot({
                color: spotLight.color,
                intensity: spotLight.intensity,
                position: [spotLight.position.x, spotLight.position.y, spotLight.position.z],
                target: [0, 0, 0],
                angle: spotLight.angle,
                penumbra: spotLight.penumbra,
                distance: 30,
                decay: 2
            });
        } else {
            spotLightInstance.color.setHex(spotLight.color.replace('#', '0x'));
            spotLightInstance.intensity = spotLight.intensity;
            spotLightInstance.position.set(
                spotLight.position.x,
                spotLight.position.y,
                spotLight.position.z
            );
            spotLightInstance.angle = spotLight.angle;
            spotLightInstance.penumbra = spotLight.penumbra;
        }
    } else {
        if (spotLightInstance) {
            scene.scene.remove(spotLightInstance);
            spotLightInstance = null;
        }
    }
};

// 设置预设灯光配置
const setLightingPreset = (preset) => {
    if (!scene) return;

    // 清除所有灯光
    scene.light.removeAll();
    ambientLightInstance = null;
    directionalLightInstance = null;
    pointLightInstance = null;
    spotLightInstance = null;

    const presets = {
        daylight: {
            ambient: { enabled: true, intensity: 0.6, color: '#87CEEB' },
            directional: {
                enabled: true,
                intensity: 1.2,
                color: '#FFF8DC',
                position: { x: 10, y: 20, z: 10 },
                castShadow: true
            },
            point: { enabled: false },
            spot: { enabled: false }
        },
        sunset: {
            ambient: { enabled: true, intensity: 0.3, color: '#FF6347' },
            directional: {
                enabled: true,
                intensity: 0.8,
                color: '#FF8C00',
                position: { x: -10, y: 5, z: 10 },
                castShadow: true
            },
            point: { enabled: false },
            spot: { enabled: false }
        },
        night: {
            ambient: { enabled: true, intensity: 0.2, color: '#191970' },
            directional: { enabled: false },
            point: {
                enabled: true,
                intensity: 2.0,
                color: '#FFD700',
                position: { x: 0, y: 10, z: 0 },
                distance: 25,
                decay: 2
            },
            spot: { enabled: false }
        },
        studio: {
            ambient: { enabled: true, intensity: 0.3, color: '#ffffff' },
            directional: {
                enabled: true,
                intensity: 1.0,
                color: '#ffffff',
                position: { x: 10, y: 10, z: 10 },
                castShadow: true
            },
            point: { enabled: false },
            spot: {
                enabled: true,
                intensity: 1.5,
                color: '#ffffff',
                position: { x: -5, y: 10, z: 5 },
                angle: Math.PI / 4,
                penumbra: 0.2
            }
        }
    };

    const config = presets[preset];
    if (config) {
        // 应用预设配置
        Object.assign(ambientLight, config.ambient);
        Object.assign(directionalLight, config.directional);
        Object.assign(pointLight, config.point);
        Object.assign(spotLight, config.spot);

        // 重新初始化灯光
        initLights();
    }
};

// 重置灯光
const resetLighting = () => {
    ambientLight.enabled = true;
    ambientLight.intensity = 0.4;
    ambientLight.color = '#ffffff';

    directionalLight.enabled = true;
    directionalLight.intensity = 1.0;
    directionalLight.color = '#ffffff';
    directionalLight.position = { x: 10, y: 10, z: 5 };
    directionalLight.castShadow = true;

    pointLight.enabled = false;
    pointLight.intensity = 1.0;
    pointLight.color = '#ff6b6b';
    pointLight.position = { x: 5, y: 8, z: 5 };
    pointLight.distance = 20;
    pointLight.decay = 2;

    spotLight.enabled = false;
    spotLight.intensity = 1.0;
    spotLight.color = '#4ecdc4';
    spotLight.position = { x: -5, y: 10, z: 5 };
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.1;

    // 重新初始化灯光
    if (scene) {
        scene.light.removeAll();
        ambientLightInstance = null;
        directionalLightInstance = null;
        pointLightInstance = null;
        spotLightInstance = null;
        initLights();
    }
};

// 清理资源
const cleanup = () => {
    console.log('Cleaning up Lighting example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    gridHelper = null;
    sphere = null;
    plane = null;
    cube = null;
    ambientLightInstance = null;
    directionalLightInstance = null;
    pointLightInstance = null;
    spotLightInstance = null;
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 10px;
}

.preset-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>

