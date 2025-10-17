<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        :title="t('home.examples.17-shader-material.title')"
    >
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">{{ t('shaderMaterial.title') }}</h3>

            <!-- 加载状态 -->
            <div v-if="isLoading" class="section">
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>{{ t('shaderMaterial.loading') }} {{ loadProgress.toFixed(0) }}%</p>
                </div>
            </div>

            <!-- 材质选择 -->
            <div v-if="!isLoading" class="section">
                <h4>{{ t('shaderMaterial.materialSelection') }}</h4>

                <div class="form-group">
                    <label>{{ t('shaderMaterial.currentMaterial') }}</label>
                    <select v-model="currentMaterialName" @change="switchMaterial">
                        <option value="basicColor">
                            {{ t('shaderMaterial.materials.basicColor') }}
                        </option>
                        <option value="gradient">
                            {{ t('shaderMaterial.materials.gradient') }}
                        </option>
                        <option value="animated">
                            {{ t('shaderMaterial.materials.animated') }}
                        </option>
                    </select>
                </div>

                <div class="info-item">
                    <span>{{ t('shaderMaterial.activeMaterial') }}</span>
                    <span class="value">{{ currentMaterialName }}</span>
                </div>
            </div>

            <!-- 材质参数 -->
            <div v-if="!isLoading && currentMaterialName === 'basicColor'" class="section">
                <h4>{{ t('shaderMaterial.materialParams') }}</h4>

                <div class="form-group">
                    <label>{{ t('params.color') }}</label>
                    <input
                        v-model="basicColorParams.color"
                        type="color"
                        @input="updateBasicColor"
                    />
                </div>
            </div>

            <div v-if="!isLoading && currentMaterialName === 'gradient'" class="section">
                <h4>{{ t('shaderMaterial.materialParams') }}</h4>

                <div class="form-group">
                    <label>{{ t('shaderMaterial.color1') }}</label>
                    <input
                        v-model="gradientParams.color1"
                        type="color"
                        @input="updateGradientColors"
                    />
                </div>

                <div class="form-group">
                    <label>{{ t('shaderMaterial.color2') }}</label>
                    <input
                        v-model="gradientParams.color2"
                        type="color"
                        @input="updateGradientColors"
                    />
                </div>
            </div>

            <div v-if="!isLoading && currentMaterialName === 'animated'" class="section">
                <h4>{{ t('shaderMaterial.materialParams') }}</h4>

                <div class="form-group">
                    <label>{{ t('params.color') }}</label>
                    <input
                        v-model="animatedParams.color"
                        type="color"
                        @input="updateAnimatedColor"
                    />
                </div>

                <div class="form-group">
                    <label>{{ t('params.speed') }} {{ animatedParams.speed.toFixed(1) }}</label>
                    <input
                        v-model.number="animatedParams.speed"
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        @input="updateAnimatedSpeed"
                    />
                </div>
            </div>

            <!-- 材质列表 -->
            <div v-if="!isLoading" class="section">
                <h4>{{ t('shaderMaterial.materialList') }}</h4>
                <div class="material-list">
                    <div v-for="mat in materialList" :key="mat.name" class="material-item">
                        <span class="material-name">{{ mat.name }}</span>
                        <span class="material-badge">{{ t('shaderMaterial.shader') }}</span>
                    </div>
                </div>
            </div>

            <!-- 性能统计 -->
            <div v-if="!isLoading" class="section">
                <h4>{{ t('stats.title') }}</h4>
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-label">{{ t('stats.fps') }}:</span>
                        <span class="stat-value">{{ fps }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">{{ t('shaderMaterial.materialCount') }}:</span>
                        <span class="stat-value">{{ materialList.length }}</span>
                    </div>
                </div>
            </div>

            <!-- 事件日志 -->
            <div v-if="!isLoading" class="section">
                <h4>{{ t('controls.eventLog') }}</h4>
                <div class="event-log">
                    <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-message">{{ log.message }}</span>
                    </div>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Scene } from '@w3d/core';
import { ShaderMaterial, ModelLoader, GridHelper, HDRLoader } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';

const { t } = useI18n();

// 场景容器引用
const sceneContainer = ref(null);

// 场景实例
let scene = null;

// ShaderMaterial 组件实例
let shaderMaterialComponent = null;

// ModelLoader 组件实例
let modelLoader = null;

// 加载的模型
let loadedModel = null;

// 加载状态
const isLoading = ref(true);
const loadProgress = ref(0);

// 当前材质名称
const currentMaterialName = ref('basicColor');

// 材质列表
const materialList = ref([]);

// 基础颜色材质参数
const basicColorParams = reactive({
    color: '#00ff00'
});

// 渐变材质参数
const gradientParams = reactive({
    color1: '#ff0000',
    color2: '#0000ff'
});

// 动画材质参数
const animatedParams = reactive({
    color: '#00ff00',
    speed: 1.0
});

// 性能统计
const fps = ref(60);

// 事件日志
const eventLogs = ref([]);

// 添加日志
const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    eventLogs.value.unshift({ time, message });
    if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
    }
};

// 初始化场景
const initScene = async () => {
    scene = new Scene(sceneContainer.value, {
        renderer: {
            antialias: true,
            outputColorSpace: 'srgb'
        },
        camera: {
            fov: 45,
            position: [0, 2, 5],
            lookAt: [0, 0, 0]
        }
    });

    scene.init();

    // 添加灯光
    scene.light.addAmbient({
        color: '#ffffff',
        intensity: 0.6
    });

    scene.light.addDirectional({
        color: '#ffffff',
        intensity: 0.8,
        position: [5, 5, 5],
        castShadow: true
    });

    // 启用阴影
    scene.renderer.enableShadow(true);

    // 启用自动调整大小
    scene.renderer.enableResize();

    // 注册组件
    scene.registerComponent('ShaderMaterial', ShaderMaterial);
    scene.registerComponent('ModelLoader', ModelLoader);
    scene.registerComponent('GridHelper', GridHelper);
    scene.registerComponent('HDRLoader', HDRLoader);

    // 添加网格辅助
    await scene.add('GridHelper', {
        name: 'grid',
        size: 20,
        divisions: 20
    });

    // 加载 HDR 环境贴图
    const hdrLoader = await scene.add('HDRLoader', {
        name: 'hdrLoader'
    });

    hdrLoader.on('loaded', ({ texture }) => {
        scene.scene.environment = texture;
        scene.scene.background = texture;
        scene.scene.backgroundBlurriness = 0.5;
    });

    await hdrLoader.load('/hdr/venice_sunset_1k.hdr');

    // 创建 ShaderMaterial 组件
    await createShaderMaterials();

    // 加载模型
    await loadModel();

    // 启动渲染循环
    scene.start();

    // 更新 FPS
    setInterval(() => {
        fps.value = Math.round(scene.renderer.getFPS());
    }, 1000);
};

// 创建着色器材质
const createShaderMaterials = async () => {
    shaderMaterialComponent = await scene.add('ShaderMaterial', {
        name: 'shaderManager'
    });

    // 监听事件
    shaderMaterialComponent.on('materialCreated', ({ name }) => {
        addLog(`材质 "${name}" 已创建`);
        updateMaterialList();
    });

    shaderMaterialComponent.on('materialRemoved', ({ name }) => {
        addLog(`材质 "${name}" 已删除`);
        updateMaterialList();
    });

    shaderMaterialComponent.on('uniformUpdated', ({ materialName, uniformName }) => {
        addLog(`材质 "${materialName}" 的 ${uniformName} 已更新`);
    });

    // 创建基础颜色材质
    shaderMaterialComponent.createMaterial('basicColor', {
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vec3 light = normalize(vec3(1.0, 1.0, 1.0));
                float dProd = max(0.0, dot(vNormal, light));
                gl_FragColor = vec4(color * (0.3 + 0.7 * dProd), 1.0);
            }
        `,
        uniforms: {
            color: { value: new THREE.Color(basicColorParams.color) }
        },
        side: THREE.DoubleSide
    });

    // 创建渐变材质
    shaderMaterialComponent.createMaterial('gradient', {
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(color1, color2, vUv.y);
                vec3 light = normalize(vec3(1.0, 1.0, 1.0));
                float dProd = max(0.0, dot(vNormal, light));
                gl_FragColor = vec4(color * (0.3 + 0.7 * dProd), 1.0);
            }
        `,
        uniforms: {
            color1: { value: new THREE.Color(gradientParams.color1) },
            color2: { value: new THREE.Color(gradientParams.color2) }
        },
        side: THREE.DoubleSide
    });

    // 创建动画材质
    shaderMaterialComponent.createMaterial('animated', {
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            uniform float speed;
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                float wave = sin(vUv.x * 10.0 + time * speed) * 0.5 + 0.5;
                vec3 finalColor = color * wave;
                vec3 light = normalize(vec3(1.0, 1.0, 1.0));
                float dProd = max(0.0, dot(vNormal, light));
                gl_FragColor = vec4(finalColor * (0.3 + 0.7 * dProd), 1.0);
            }
        `,
        uniforms: {
            time: { value: 0.0 },
            color: { value: new THREE.Color(animatedParams.color) },
            speed: { value: animatedParams.speed }
        },
        side: THREE.DoubleSide
    });

    updateMaterialList();
};

// 加载模型
const loadModel = async () => {
    modelLoader = await scene.add('ModelLoader', {
        name: 'planeModel',
        url: '/models/plane.glb'
    });

    modelLoader.on('progress', ({ progress }) => {
        loadProgress.value = progress * 100;
    });

    modelLoader.on('loaded', ({ model }) => {
        loadedModel = model;
        model.position.set(0, 0, 0);
        model.scale.set(2, 2, 2);

        // 应用默认材质
        applyMaterialToModel(currentMaterialName.value);

        isLoading.value = false;
        addLog('模型加载完成');
    });

    modelLoader.on('error', ({ error }) => {
        console.error('模型加载失败:', error);
        addLog(`模型加载失败: ${error.message}`);
        isLoading.value = false;
    });
};

// 应用材质到模型
const applyMaterialToModel = (materialName) => {
    if (!loadedModel || !shaderMaterialComponent) return;

    const material = shaderMaterialComponent.getMaterial(materialName);
    if (!material) {
        console.error(`材质 "${materialName}" 不存在`);
        return;
    }

    loadedModel.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
    });

    addLog(`已应用材质: ${materialName}`);
};

// 切换材质
const switchMaterial = () => {
    applyMaterialToModel(currentMaterialName.value);
};

// 更新材质列表
const updateMaterialList = () => {
    if (!shaderMaterialComponent) return;
    materialList.value = shaderMaterialComponent.getAllMaterials();
};

// 更新基础颜色
const updateBasicColor = () => {
    if (!shaderMaterialComponent) return;
    shaderMaterialComponent.updateUniform(
        'basicColor',
        'color',
        new THREE.Color(basicColorParams.color)
    );
};

// 更新渐变颜色
const updateGradientColors = () => {
    if (!shaderMaterialComponent) return;
    shaderMaterialComponent.updateUniform(
        'gradient',
        'color1',
        new THREE.Color(gradientParams.color1)
    );
    shaderMaterialComponent.updateUniform(
        'gradient',
        'color2',
        new THREE.Color(gradientParams.color2)
    );
};

// 更新动画颜色
const updateAnimatedColor = () => {
    if (!shaderMaterialComponent) return;
    shaderMaterialComponent.updateUniform(
        'animated',
        'color',
        new THREE.Color(animatedParams.color)
    );
};

// 更新动画速度
const updateAnimatedSpeed = () => {
    if (!shaderMaterialComponent) return;
    shaderMaterialComponent.updateUniform('animated', 'speed', animatedParams.speed);
};

// 组件挂载
onMounted(() => {
    initScene();
});

// 组件卸载
onUnmounted(() => {
    if (scene) {
        scene.dispose();
    }
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { ShaderMaterial, ModelLoader, GridHelper, HDRLoader } from '@w3d/components';
import * as THREE from 'three';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [0, 2, 5],
    lookAt: [0, 0, 0]
  }
});

scene.init();

// 添加灯光
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.6
});

scene.light.addDirectional({
  color: '#ffffff',
  intensity: 0.8,
  position: [5, 5, 5],
  castShadow: true
});

// 注册组件
scene.registerComponent('ShaderMaterial', ShaderMaterial);
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('GridHelper', GridHelper);
scene.registerComponent('HDRLoader', HDRLoader);

// 添加网格
await scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20
});

// 加载 HDR 环境贴图
const hdrLoader = await scene.add('HDRLoader', {
  name: 'hdrLoader'
});

hdrLoader.on('loaded', ({ texture }) => {
  scene.scene.environment = texture;
  scene.scene.background = texture;
  scene.scene.backgroundBlurriness = 0.5;
});

await hdrLoader.load('/hdr/venice_sunset_1k.hdr');

// 创建 ShaderMaterial 组件
const shaderMaterial = await scene.add('ShaderMaterial', {
  name: 'shaderManager'
});

// 监听材质创建事件
shaderMaterial.on('materialCreated', ({ name, material }) => {
  console.log(\`材质 "\${name}" 已创建\`, material);
});

// 创建基础颜色材质
shaderMaterial.createMaterial('basicColor', {
  vertexShader: \\\`
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \\\`,
  fragmentShader: \\\`
    uniform vec3 color;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vec3 light = normalize(vec3(1.0, 1.0, 1.0));
      float dProd = max(0.0, dot(vNormal, light));
      gl_FragColor = vec4(color * (0.3 + 0.7 * dProd), 1.0);
    }
  \\\`,
  uniforms: {
    color: { value: new THREE.Color(0x00ff00) }
  },
  side: THREE.DoubleSide
});

// 创建渐变材质
shaderMaterial.createMaterial('gradient', {
  vertexShader: \\\`
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \\\`,
  fragmentShader: \\\`
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vec3 color = mix(color1, color2, vUv.y);
      vec3 light = normalize(vec3(1.0, 1.0, 1.0));
      float dProd = max(0.0, dot(vNormal, light));
      gl_FragColor = vec4(color * (0.3 + 0.7 * dProd), 1.0);
    }
  \\\`,
  uniforms: {
    color1: { value: new THREE.Color(0xff0000) },
    color2: { value: new THREE.Color(0x0000ff) }
  },
  side: THREE.DoubleSide
});

// 创建动画材质
shaderMaterial.createMaterial('animated', {
  vertexShader: \\\`
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \\\`,
  fragmentShader: \\\`
    uniform float time;
    uniform vec3 color;
    uniform float speed;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float wave = sin(vUv.x * 10.0 + time * speed) * 0.5 + 0.5;
      vec3 finalColor = color * wave;
      vec3 light = normalize(vec3(1.0, 1.0, 1.0));
      float dProd = max(0.0, dot(vNormal, light));
      gl_FragColor = vec4(finalColor * (0.3 + 0.7 * dProd), 1.0);
    }
  \\\`,
  uniforms: {
    time: { value: 0.0 },  // 自动更新
    color: { value: new THREE.Color(0x00ff00) },
    speed: { value: 1.0 }
  },
  side: THREE.DoubleSide
});

// 加载模型
const modelLoader = await scene.add('ModelLoader', {
  name: 'planeModel',
  url: '/models/plane.glb'
});

modelLoader.on('loaded', ({ model }) => {
  model.position.set(0, 0, 0);
  model.scale.set(2, 2, 2);

  // 应用着色器材质
  const material = shaderMaterial.getMaterial('basicColor');
  model.traverse((child) => {
    if (child.isMesh) {
      child.material = material;
    }
  });
});

// 切换材质
function switchMaterial(materialName) {
  const material = shaderMaterial.getMaterial(materialName);
  if (material) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
  }
}

// 更新材质参数
shaderMaterial.updateUniform('basicColor', 'color', new THREE.Color(0xff0000));

// 获取所有材质
const materials = shaderMaterial.getAllMaterials();
console.log('所有材质:', materials);

// 启动渲染
scene.start();

/**
 * 技术要点：
 *
 * 1. ShaderMaterial 组件管理
 *    - 创建多个着色器材质
 *    - 通过名称管理材质
 *    - 动态切换材质
 *
 * 2. 着色器编程
 *    - 顶点着色器（Vertex Shader）
 *    - 片段着色器（Fragment Shader）
 *    - Uniform 变量传递
 *
 * 3. 材质类型
 *    - 基础颜色材质：简单的颜色着色
 *    - 渐变材质：颜色渐变效果
 *    - 动画材质：使用 time uniform 创建动画
 *
 * 4. 光照计算
 *    - 简单的漫反射光照
 *    - 法线变换
 *    - 光照强度计算
 *
 * 5. 材质应用
 *    - 遍历模型节点
 *    - 替换材质
 *    - 实时切换
 */`;
</script>

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
}

.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    padding: 20px;
    color: #fff;
    font-family: 'Arial', sans-serif;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.panel-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: bold;
    color: #00ff88;
    border-bottom: 2px solid #00ff88;
    padding-bottom: 10px;
}

.section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section:last-child {
    border-bottom: none;
}

.section h4 {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #00ff88;
    font-weight: 600;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #ccc;
}

.form-group input[type='range'] {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
}

.form-group input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #00ff88;
    cursor: pointer;
}

.form-group input[type='color'] {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.form-group select {
    width: 100%;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
}

.form-group select option {
    background: #1a1a1a;
    color: #fff;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;
}

.info-item .value {
    color: #00ff88;
    font-weight: 600;
}

.material-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.material-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    font-size: 13px;
}

.material-name {
    color: #fff;
    font-weight: 500;
}

.material-badge {
    padding: 2px 8px;
    background: #00ff88;
    color: #000;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
}

.stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.stat-label {
    font-size: 13px;
    color: #ccc;
}

.stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #00ff88;
}

.event-log {
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 10px;
}

.log-item {
    display: flex;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 12px;
}

.log-item:last-child {
    border-bottom: none;
}

.log-time {
    color: #00ff88;
    font-weight: 600;
    min-width: 80px;
}

.log-message {
    color: #ccc;
    flex: 1;
}

.loading-indicator {
    text-align: center;
    padding: 20px;
}

.spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 15px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-indicator p {
    color: #00ff88;
    font-size: 14px;
    margin: 0;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.event-log::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.event-log::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.event-log::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.event-log::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.7);
}
</style>
