<template>
    <SplitLayout :code="sourceCode" language="javascript" title="03 - Lighting">
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
                <!-- 环境光控制 -->
                <div class="control-section">
                    <h4>环境光 (Ambient Light)</h4>
                    <div class="light-controls">
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="ambientLight.enabled"
                                    @change="updateAmbientLight"
                                />
                                启用环境光
                            </label>
                        </div>
                        <div class="param-group">
                            <label>强度</label>
                            <input
                                type="range"
                                v-model.number="ambientLight.intensity"
                                @input="updateAmbientLight"
                                min="0"
                                max="2"
                                step="0.1"
                                :disabled="!ambientLight.enabled"
                            />
                            <span>{{ ambientLight.intensity }}</span>
                        </div>
                        <div class="param-group">
                            <label>颜色</label>
                            <input
                                type="color"
                                v-model="ambientLight.color"
                                @input="updateAmbientLight"
                                :disabled="!ambientLight.enabled"
                            />
                        </div>
                    </div>
                </div>

                <!-- 平行光控制 -->
                <div class="control-section">
                    <h4>平行光 (Directional Light)</h4>
                    <div class="light-controls">
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="directionalLight.enabled"
                                    @change="updateDirectionalLight"
                                />
                                启用平行光
                            </label>
                        </div>
                        <div class="param-group">
                            <label>强度</label>
                            <input
                                type="range"
                                v-model.number="directionalLight.intensity"
                                @input="updateDirectionalLight"
                                min="0"
                                max="3"
                                step="0.1"
                                :disabled="!directionalLight.enabled"
                            />
                            <span>{{ directionalLight.intensity }}</span>
                        </div>
                        <div class="param-group">
                            <label>颜色</label>
                            <input
                                type="color"
                                v-model="directionalLight.color"
                                @input="updateDirectionalLight"
                                :disabled="!directionalLight.enabled"
                            />
                        </div>
                        <div class="position-controls">
                            <div class="input-group">
                                <label>X</label>
                                <input
                                    type="number"
                                    v-model.number="directionalLight.position.x"
                                    @input="updateDirectionalLight"
                                    step="1"
                                    :disabled="!directionalLight.enabled"
                                />
                            </div>
                            <div class="input-group">
                                <label>Y</label>
                                <input
                                    type="number"
                                    v-model.number="directionalLight.position.y"
                                    @input="updateDirectionalLight"
                                    step="1"
                                    :disabled="!directionalLight.enabled"
                                />
                            </div>
                            <div class="input-group">
                                <label>Z</label>
                                <input
                                    type="number"
                                    v-model.number="directionalLight.position.z"
                                    @input="updateDirectionalLight"
                                    step="1"
                                    :disabled="!directionalLight.enabled"
                                />
                            </div>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="directionalLight.castShadow"
                                    @change="updateDirectionalLight"
                                    :disabled="!directionalLight.enabled"
                                />
                                投射阴影
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 点光源控制 -->
                <div class="control-section">
                    <h4>点光源 (Point Light)</h4>
                    <div class="light-controls">
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="pointLight.enabled"
                                    @change="updatePointLight"
                                />
                                启用点光源
                            </label>
                        </div>
                        <div class="param-group">
                            <label>强度</label>
                            <input
                                type="range"
                                v-model.number="pointLight.intensity"
                                @input="updatePointLight"
                                min="0"
                                max="5"
                                step="0.1"
                                :disabled="!pointLight.enabled"
                            />
                            <span>{{ pointLight.intensity }}</span>
                        </div>
                        <div class="param-group">
                            <label>颜色</label>
                            <input
                                type="color"
                                v-model="pointLight.color"
                                @input="updatePointLight"
                                :disabled="!pointLight.enabled"
                            />
                        </div>
                        <div class="position-controls">
                            <div class="input-group">
                                <label>X</label>
                                <input
                                    type="number"
                                    v-model.number="pointLight.position.x"
                                    @input="updatePointLight"
                                    step="1"
                                    :disabled="!pointLight.enabled"
                                />
                            </div>
                            <div class="input-group">
                                <label>Y</label>
                                <input
                                    type="number"
                                    v-model.number="pointLight.position.y"
                                    @input="updatePointLight"
                                    step="1"
                                    :disabled="!pointLight.enabled"
                                />
                            </div>
                            <div class="input-group">
                                <label>Z</label>
                                <input
                                    type="number"
                                    v-model.number="pointLight.position.z"
                                    @input="updatePointLight"
                                    step="1"
                                    :disabled="!pointLight.enabled"
                                />
                            </div>
                        </div>
                        <div class="param-group">
                            <label>距离</label>
                            <input
                                type="range"
                                v-model.number="pointLight.distance"
                                @input="updatePointLight"
                                min="0"
                                max="100"
                                step="1"
                                :disabled="!pointLight.enabled"
                            />
                            <span>{{ pointLight.distance }}</span>
                        </div>
                        <div class="param-group">
                            <label>衰减</label>
                            <input
                                type="range"
                                v-model.number="pointLight.decay"
                                @input="updatePointLight"
                                min="0"
                                max="5"
                                step="0.1"
                                :disabled="!pointLight.enabled"
                            />
                            <span>{{ pointLight.decay }}</span>
                        </div>
                    </div>
                </div>

                <!-- 聚光灯控制 -->
                <div class="control-section">
                    <h4>聚光灯 (Spot Light)</h4>
                    <div class="light-controls">
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="spotLight.enabled"
                                    @change="updateSpotLight"
                                />
                                启用聚光灯
                            </label>
                        </div>
                        <div class="param-group">
                            <label>强度</label>
                            <input
                                type="range"
                                v-model.number="spotLight.intensity"
                                @input="updateSpotLight"
                                min="0"
                                max="5"
                                step="0.1"
                                :disabled="!spotLight.enabled"
                            />
                            <span>{{ spotLight.intensity }}</span>
                        </div>
                        <div class="param-group">
                            <label>颜色</label>
                            <input
                                type="color"
                                v-model="spotLight.color"
                                @input="updateSpotLight"
                                :disabled="!spotLight.enabled"
                            />
                        </div>
                        <div class="position-controls">
                            <div class="input-group">
                                <label>X</label>
                                <input
                                    type="number"
                                    v-model.number="spotLight.position.x"
                                    @input="updateSpotLight"
                                    step="1"
                                    :disabled="!spotLight.enabled"
                                />
                            </div>
                            <div class="input-group">
                                <label>Y</label>
                                <input
                                    type="number"
                                    v-model.number="spotLight.position.y"
                                    @input="updateSpotLight"
                                    step="1"
                                    :disabled="!spotLight.enabled"
                                />
                            </div>
                            <div class="input-group">
                                <label>Z</label>
                                <input
                                    type="number"
                                    v-model.number="spotLight.position.z"
                                    @input="updateSpotLight"
                                    step="1"
                                    :disabled="!spotLight.enabled"
                                />
                            </div>
                        </div>
                        <div class="param-group">
                            <label>角度</label>
                            <input
                                type="range"
                                v-model.number="spotLight.angle"
                                @input="updateSpotLight"
                                min="0.1"
                                max="1.57"
                                step="0.01"
                                :disabled="!spotLight.enabled"
                            />
                            <span>{{ Math.round((spotLight.angle * 180) / Math.PI) }}°</span>
                        </div>
                        <div class="param-group">
                            <label>边缘模糊</label>
                            <input
                                type="range"
                                v-model.number="spotLight.penumbra"
                                @input="updateSpotLight"
                                min="0"
                                max="1"
                                step="0.01"
                                :disabled="!spotLight.enabled"
                            />
                            <span>{{ spotLight.penumbra }}</span>
                        </div>
                    </div>
                </div>

                <!-- 预设配置 -->
                <div class="control-section">
                    <h4>预设配置</h4>
                    <div class="preset-buttons">
                        <button @click="setLightingPreset('daylight')" class="preset-btn">
                            日光
                        </button>
                        <button @click="setLightingPreset('sunset')" class="preset-btn">
                            夕阳
                        </button>
                        <button @click="setLightingPreset('night')" class="preset-btn">夜晚</button>
                        <button @click="setLightingPreset('studio')" class="preset-btn">
                            工作室
                        </button>
                        <button @click="resetLighting" class="reset-btn">重置</button>
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
    width: 320px;
    max-height: calc(100vh - 40px);
    background: rgba(0, 0, 0, 0.85);
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

.light-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.position-controls {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
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

.input-group input[type='number']:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.param-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
    appearance: none;
}

.param-group input[type='range']:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

.param-group input[type='color'] {
    width: 100%;
    height: 35px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
}

.param-group input[type='color']:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    justify-content: flex-start;
    margin-bottom: 8px;
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

