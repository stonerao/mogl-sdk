<template>
    <SplitLayout :code="sourceCode" language="javascript" title="18 - Path Tracer">
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

            <!-- 渲染进度 -->
            <div v-if="isRendering" class="render-overlay">
                <div class="render-info">
                    <div class="render-title">GPU 路径追踪渲染中...</div>
                    <div class="render-progress">
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{ width: renderProgress + '%' }"
                            ></div>
                        </div>
                        <span class="progress-text">{{ renderProgress }}%</span>
                    </div>
                    <div class="render-stats">
                        <span>采样数: {{ currentSamples }} / {{ targetSamples }}</span>
                    </div>
                </div>
            </div>

            <!-- 控制面板 -->
            <div class="control-panel">
                <!-- 渲染控制 -->
                <div class="control-section">
                    <h4>渲染控制</h4>
                    <div class="render-controls">
                        <div class="button-group">
                            <button @click="startRender" :disabled="!pathTracer || isRendering">
                                开始渲染
                            </button>
                            <button @click="pauseRender" :disabled="!pathTracer || !isRendering">
                                暂停
                            </button>
                            <button @click="resumeRender" :disabled="!pathTracer || isRendering">
                                继续
                            </button>
                            <button @click="resetRender" :disabled="!pathTracer">重置</button>
                        </div>
                        <div class="button-group">
                            <button
                                @click="downloadRender"
                                :disabled="!pathTracer"
                                class="download-btn"
                            >
                                下载图片
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 渲染设置 -->
                <div class="control-section">
                    <h4>渲染设置</h4>
                    <div class="param-group">
                        <label>目标采样数</label>
                        <input
                            type="range"
                            v-model.number="renderSettings.samples"
                            @change="updateRenderSettings"
                            min="10"
                            max="500"
                            step="10"
                        />
                        <span>{{ renderSettings.samples }}</span>
                    </div>
                    <div class="param-group">
                        <label>分辨率缩放</label>
                        <input
                            type="range"
                            v-model.number="renderSettings.resolutionScale"
                            @change="updateRenderSettings"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                        />
                        <span>{{ renderSettings.resolutionScale }}</span>
                    </div>
                    <div class="param-group">
                        <label>分块数 (Tiles)</label>
                        <input
                            type="range"
                            v-model.number="renderSettings.tiles"
                            @change="updateRenderSettings"
                            min="1"
                            max="6"
                            step="1"
                        />
                        <span>{{ renderSettings.tiles }} x {{ renderSettings.tiles }}</span>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                v-model="renderSettings.toneMapping"
                                @change="updateRenderSettings"
                            />
                            启用色调映射
                        </label>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                v-model="renderSettings.transparentBackground"
                                @change="updateRenderSettings"
                            />
                            透明背景
                        </label>
                    </div>
                </div>

                <!-- 地板设置 -->
                <div class="control-section">
                    <h4>地板设置</h4>
                    <div class="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                v-model="floorSettings.enabled"
                                @change="recreatePathTracer"
                            />
                            启用地板
                        </label>
                    </div>
                    <div v-if="floorSettings.enabled">
                        <div class="param-group">
                            <label>粗糙度</label>
                            <input
                                type="range"
                                v-model.number="floorSettings.roughness"
                                @change="updateFloorMaterial"
                                min="0"
                                max="1"
                                step="0.01"
                            />
                            <span>{{ floorSettings.roughness.toFixed(2) }}</span>
                        </div>
                        <div class="param-group">
                            <label>金属度</label>
                            <input
                                type="range"
                                v-model.number="floorSettings.metalness"
                                @change="updateFloorMaterial"
                                min="0"
                                max="1"
                                step="0.01"
                            />
                            <span>{{ floorSettings.metalness.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- 材质调整 -->
                <div class="control-section">
                    <h4>材质调整</h4>
                    <div class="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                v-model="materialSettings.adjustMaterials"
                                @change="recreatePathTracer"
                            />
                            自动调整材质
                        </label>
                    </div>
                    <div v-if="materialSettings.adjustMaterials">
                        <div class="param-group">
                            <label>粗糙度缩放</label>
                            <input
                                type="range"
                                v-model.number="materialSettings.roughnessScale"
                                @change="recreatePathTracer"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                            />
                            <span>{{ materialSettings.roughnessScale.toFixed(2) }}</span>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="materialSettings.enableTransmission"
                                    @change="recreatePathTracer"
                                />
                                启用透射效果
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 渲染信息 -->
                <div class="control-section">
                    <h4>渲染信息</h4>
                    <div class="info-display">
                        <div class="info-item">
                            <span class="info-label">状态:</span>
                            <span class="info-value">{{ renderStatus }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">当前采样:</span>
                            <span class="info-value">{{ currentSamples }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">进度:</span>
                            <span class="info-value">{{ renderProgress }}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { PathTracer, ModelLoader, GridHelper, HDRLoader } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('加载中...');
const loadingProgress = ref(0);
const isRendering = ref(false);
const renderProgress = ref(0);
const currentSamples = ref(0);
const targetSamples = ref(100);
const renderStatus = ref('未开始');

let scene = null;
let pathTracer = null;
let model = null;

// 渲染设置
const renderSettings = reactive({
    samples: 100,
    resolutionScale: 1.0,
    tiles: 3,
    toneMapping: true,
    transparentBackground: false
});

// 地板设置
const floorSettings = reactive({
    enabled: true,
    roughness: 0.15,
    metalness: 0.9
});

// 材质设置
const materialSettings = reactive({
    adjustMaterials: true,
    roughnessScale: 0.25,
    enableTransmission: true
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { PathTracer, ModelLoader } from '@w3d/components';

// 创建场景 (启用相机控制器)
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  },
  camera: {
    fov: 45,
    position: [5, 5, 10],
    lookAt: [0, 0, 0]
  },
  controls: {
    enabled: true,        // 启用相机控制
    enableDamping: true   // 启用阻尼效果
  }
});

scene.init();

// 注册组件
scene.registerComponent('PathTracer', PathTracer);
scene.registerComponent('ModelLoader', ModelLoader);

// 加载模型
const model = await scene.add('ModelLoader', {
  name: 'christmas',
  url: '/models/christmas.glb',
  scale: 1.0,
  position: [0, 0, 0]
});

// 等待模型加载完成
model.on('loadComplete', async () => {
  // 从场景中移除模型 (PathTracer 会重新添加)
  scene.scene.remove(model.model);

  // 创建路径追踪器 (使用 model.model 获取实际的 THREE.Group)
  const pathTracer = await scene.add('PathTracer', {
    name: 'pathtracer',
    model: model.model,  // ⚠️ 重要: 使用 model.model 而不是 model
    samples: 100,
    tiles: 3,
    resolutionScale: 1.0,
    adjustMaterials: true,
    materialConfig: {
      roughnessScale: 0.25,
      enableTransmission: true,
      transmissionIOR: 1.4
    },
    floor: {
      enabled: true,
      roughness: 0.15,
      metalness: 0.9
    },
    toneMapping: true,
    autoStart: true
  });

  // 监听相机变化 (自动支持)
  pathTracer.on('cameraChanged', () => {
    console.log('相机位置改变,重新渲染中...');
  });

  // 监听渲染进度
  pathTracer.on('progress', (data) => {
    const percent = (data.progress * 100).toFixed(1);
    console.log(\`渲染进度: \${percent}%\`);
    console.log(\`采样数: \${data.samples}/\${data.targetSamples}\`);
  });

  // 监听渲染完成
  pathTracer.on('complete', (data) => {
    console.log('渲染完成!', data.samples);
    // 可以下载渲染结果
    pathTracer.download('pathtraced-render.png');
  });

  // 控制方法
  // pathTracer.start();   // 开始渲染
  // pathTracer.pause();   // 暂停渲染
  // pathTracer.resume();  // 恢复渲染
  // pathTracer.reset();   // 重置渲染
});

// 用户可以自由旋转、缩放、平移相机
// PathTracer 会自动更新并重新渲染

`;

// 初始化场景
onMounted(async () => {
    if (!sceneContainer.value) return;

    try {
        // 创建场景
        scene = new Scene(sceneContainer.value, {
            isRendering: false,
            renderer: {
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true
            },
            camera: {
                fov: 45,
                position: [445, 445, 440],
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
            position: [5, 5, 5]
        });

        // 注册组件
        scene.registerComponent('PathTracer', PathTracer);
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('GridHelper', GridHelper);
        scene.registerComponent('HDRLoader', HDRLoader);
        // 加载 HDR 环境贴图
        await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });
        // 添加网格
        await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20
        });

        // 加载模型
        isLoading.value = true;
        loadingText.value = '加载模型中...';

        model = await scene.add('ModelLoader', {
            name: 'christmas',
            url: '/models/christmas.glb',
            scale: 1.0,
            position: [0, 0, 0]
        });

        // 监听加载进度
        model.on('loadProgress', (data) => {
            loadingProgress.value = Math.round(data.progress * 100);
        });

        model.on('loadComplete', async () => {
            isLoading.value = false;
            loadingText.value = '初始化路径追踪器...';

            // 从场景中移除模型 (PathTracer 会重新添加)
            scene.scene.remove(model.model);

            // 创建路径追踪器
            await createPathTracer();
        });
    } catch (error) {
        console.error('初始化失败:', error);
        isLoading.value = false;
    }
});

// 创建路径追踪器
const createPathTracer = async () => {
    try {
        // 移除旧的路径追踪器
        if (pathTracer) {
            scene.remove('pathtracer');
            pathTracer = null;
        }

        isLoading.value = true;
        loadingText.value = '初始化路径追踪器...';

        pathTracer = await scene.add('PathTracer', {
            name: 'pathtracer',
            model: model.model, // 使用 model.model 获取实际的 THREE.Group
            samples: renderSettings.samples,
            tiles: renderSettings.tiles,
            resolutionScale: renderSettings.resolutionScale,
            adjustMaterials: materialSettings.adjustMaterials,
            materialConfig: {
                roughnessScale: materialSettings.roughnessScale,
                enableTransmission: materialSettings.enableTransmission,
                transmissionIOR: 1.4
            },
            floor: {
                enabled: floorSettings.enabled,
                roughness: floorSettings.roughness,
                metalness: floorSettings.metalness
            },
            toneMapping: renderSettings.toneMapping,
            transparentBackground: renderSettings.transparentBackground,
            autoStart: true
        });

        // 监听渲染事件
        pathTracer.on('start', () => {
            isRendering.value = true;
            renderStatus.value = '渲染中';
        });

        pathTracer.on('pause', () => {
            isRendering.value = false;
            renderStatus.value = '已暂停';
        });

        pathTracer.on('resume', () => {
            isRendering.value = true;
            renderStatus.value = '渲染中';
        });

        pathTracer.on('stop', () => {
            isRendering.value = false;
            renderStatus.value = '已停止';
        });

        pathTracer.on('progress', (data) => {
            currentSamples.value = data.samples;
            targetSamples.value = data.targetSamples;
            renderProgress.value = Math.round(data.progress * 100);
        });

        pathTracer.on('complete', () => {
            isRendering.value = false;
            renderStatus.value = '渲染完成';
        });

        isLoading.value = false;
        isRendering.value = true;
        renderStatus.value = '渲染中';
    } catch (error) {
        console.error('创建路径追踪器失败:', error);
        isLoading.value = false;
    }
};

// 渲染控制方法
const startRender = () => {
    if (pathTracer) {
        pathTracer.start();
    }
};

const pauseRender = () => {
    if (pathTracer) {
        pathTracer.pause();
    }
};

const resumeRender = () => {
    if (pathTracer) {
        pathTracer.resume();
    }
};

const resetRender = () => {
    if (pathTracer) {
        pathTracer.reset();
        currentSamples.value = 0;
        renderProgress.value = 0;
    }
};

const downloadRender = () => {
    if (pathTracer) {
        pathTracer.download('pathtraced-christmas.png');
    }
};

// 更新渲染设置
const updateRenderSettings = () => {
    if (!pathTracer) return;

    targetSamples.value = renderSettings.samples;
    pathTracer.setResolutionScale(renderSettings.resolutionScale);
    pathTracer.setTiles(renderSettings.tiles);

    // 更新色调映射和背景需要重新创建
    if (
        pathTracer.config.toneMapping !== renderSettings.toneMapping ||
        pathTracer.config.transparentBackground !== renderSettings.transparentBackground
    ) {
        recreatePathTracer();
    }
};

// 更新地板材质
const updateFloorMaterial = () => {
    if (!pathTracer || !pathTracer.floor) return;

    pathTracer.floor.material.roughness = floorSettings.roughness;
    pathTracer.floor.material.metalness = floorSettings.metalness;
    pathTracer.updateMaterials();
};

// 重新创建路径追踪器
const recreatePathTracer = async () => {
    await createPathTracer();
};

// 清理资源
onUnmounted(() => {
    if (scene) {
        scene.dispose();
        scene = null;
    }
});
</script>

<style scoped>
.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

/* 加载状态 */
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
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 18px;
    margin-bottom: 15px;
}

.loading-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
}

.progress-bar {
    width: 200px;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ff88, #00d4ff);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 14px;
    min-width: 45px;
}

/* 渲染进度 */
.render-overlay {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    padding: 20px 30px;
    border-radius: 12px;
    z-index: 100;
    min-width: 300px;
    backdrop-filter: blur(10px);
}

.render-info {
    color: white;
}

.render-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
    text-align: center;
    color: #00ff88;
}

.render-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.render-stats {
    text-align: center;
    font-size: 14px;
    color: #aaa;
}

/* 控制面板 */
.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: calc(100% - 40px);
    background: rgba(0, 0, 0, 0.85);
    border-radius: 12px;
    padding: 20px;
    overflow-y: auto;
    backdrop-filter: blur(10px);
    color: white;
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
    font-weight: 600;
}

/* 按钮组 */
.button-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 10px;
}

.button-group:last-child {
    margin-bottom: 0;
}

.button-group button {
    padding: 10px 15px;
    background: linear-gradient(135deg, #00ff88, #00d4ff);
    color: #000;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.button-group button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
}

.button-group button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.download-btn {
    background: linear-gradient(135deg, #ff6b6b, #ff8e53) !important;
}

.download-btn:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4) !important;
}

/* 参数控制 */
.param-group {
    margin-bottom: 15px;
}

.param-group:last-child {
    margin-bottom: 0;
}

.param-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #ccc;
}

.param-group input[type='range'] {
    width: calc(100% - 60px);
    margin-right: 10px;
}

.param-group span {
    display: inline-block;
    min-width: 50px;
    text-align: right;
    font-size: 13px;
    color: #00ff88;
}

/* 设置组 */
.setting-group {
    margin-bottom: 12px;
}

.setting-group:last-child {
    margin-bottom: 0;
}

.setting-group label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
    color: #ccc;
}

.setting-group input[type='checkbox'] {
    margin-right: 8px;
    cursor: pointer;
}

/* 信息显示 */
.info-display {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 8px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 13px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-label {
    color: #aaa;
}

.info-value {
    color: #00ff88;
    font-weight: 600;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.3);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.5);
}

/* 响应式 */
@media (max-width: 768px) {
    .control-panel {
        width: calc(100% - 40px);
        max-height: 50%;
        top: auto;
        bottom: 20px;
    }

    .render-overlay {
        width: calc(100% - 40px);
        min-width: auto;
    }
}
</style>
