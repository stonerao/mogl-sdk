<template>
    <SplitLayout :code="sourceCode" language="javascript" title="InstancedModel - 实例化模型组件">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">实例化模型控制</h3>

            <!-- 加载状态 -->
            <div v-if="isLoading" class="section">
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>加载模型中... {{ loadProgress.toFixed(0) }}%</p>
                </div>
            </div>

            <!-- 实例配置 -->
            <div v-if="!isLoading" class="section">
                <h4>实例配置</h4>

                <div class="form-group">
                    <label>实例数量: {{ instanceConfig.instanceCount }}</label>
                    <input
                        v-model.number="instanceConfig.instanceCount"
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        @change="recreateInstances"
                    />
                </div>

                <div class="form-group">
                    <label>布局方式:</label>
                    <select v-model="instanceConfig.layout" @change="recreateInstances">
                        <option value="grid">网格布局</option>
                        <option value="random">随机布局</option>
                        <option value="custom">自定义数据</option>
                    </select>
                </div>

                <div v-if="instanceConfig.layout === 'grid'" class="form-group">
                    <label>网格间距 X: {{ instanceConfig.spacing.x }}</label>
                    <input
                        v-model.number="instanceConfig.spacing.x"
                        type="range"
                        min="5"
                        max="20"
                        step="1"
                        @change="recreateInstances"
                    />
                </div>

                <div v-if="instanceConfig.layout === 'grid'" class="form-group">
                    <label>网格间距 Z: {{ instanceConfig.spacing.z }}</label>
                    <input
                        v-model.number="instanceConfig.spacing.z"
                        type="range"
                        min="5"
                        max="20"
                        step="1"
                        @change="recreateInstances"
                    />
                </div>
            </div>

            <!-- 颜色配置 -->
            <div v-if="!isLoading" class="section">
                <h4>颜色配置</h4>

                <div class="form-group">
                    <label>默认颜色:</label>
                    <input
                        v-model="instanceConfig.normalColor"
                        type="color"
                        @input="updateColors"
                    />
                </div>

                <div class="form-group">
                    <label>悬停颜色:</label>
                    <input v-model="instanceConfig.hoverColor" type="color" />
                </div>

                <div class="form-group">
                    <label>点击颜色:</label>
                    <input v-model="instanceConfig.clickedColor" type="color" />
                </div>

                <button @click="resetAllColors" class="btn-primary" style="width: 100%">
                    重置所有颜色
                </button>
            </div>

            <!-- 性能统计 -->
            <div v-if="!isLoading" class="section">
                <h4>性能统计</h4>
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-label">FPS:</span>
                        <span class="stat-value">{{ fps }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">实例数量:</span>
                        <span class="stat-value">{{ instanceConfig.instanceCount }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">已点击:</span>
                        <span class="stat-value">{{ clickedCount }}</span>
                    </div>
                </div>
            </div>

            <!-- 事件日志 -->
            <div v-if="!isLoading" class="section">
                <h4>事件日志</h4>
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
import { InstancedModel, GridHelper, HDRLoader } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';

const { t } = useI18n();

// 场景容器引用
const sceneContainer = ref(null);

// 场景实例
let scene = null;

// InstancedModel 组件实例
let instancedModel = null;

// 加载状态
const isLoading = ref(true);
const loadProgress = ref(0);

// 实例配置
const instanceConfig = reactive({
    instanceCount: 1000,
    layout: 'grid',
    gridSize: { x: 100, z: 100 },
    spacing: { x: 10, z: 10 },
    normalColor: '#00ff00',
    hoverColor: '#ffff00',
    clickedColor: '#ff0000'
});

// 性能统计
const fps = ref(60);
const clickedCount = ref(0);

// 事件日志
const eventLogs = ref([]);
const maxLogs = 10;

// 加载 HDR 环境贴图
const loadHDREnvironment = async () => {
    try {
        await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            asEnvironment: true,
            asBackground: true
        });
    } catch (error) {
        console.error('HDR loading failed:', error);
        addLog(`HDR 加载失败: ${error.message}`, 'error');
    }
};

// 初始化场景
const initScene = async () => {
    // 创建场景
    scene = new Scene(sceneContainer.value);
    scene.init();

    // 注册组件
    scene.registerComponent('InstancedModel', InstancedModel);
    scene.registerComponent('GridHelper', GridHelper);
    scene.registerComponent('HDRLoader', HDRLoader);
    // 设置相机位置
    scene.camera.setPosition(0, 50, 100);
    scene.camera.lookAt(0, 0, 0);

    // 添加网格辅助
    await scene.add('GridHelper', {
        size: 200,
        divisions: 20,
        colorCenterLine: 0x444444,
        colorGrid: 0x222222
    });

    // 创建实例化模型
    await createInstancedModel();
    await loadHDREnvironment();

    // 启动 FPS 监控
    startFPSMonitor();
};

// 生成自定义实例数据
const generateCustomInstancesData = () => {
    const data = [];
    const count = 50; // 自定义模式下使用较少的实例数量以便观察

    // 创建一个圆形排列的实例，每个实例有不同的旋转和缩放
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 30;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // 高度随角度变化
        const y = Math.sin(angle * 3) * 5;

        // 旋转朝向圆心
        const rotationY = angle + Math.PI;

        // 缩放随位置变化
        const scale = 0.5 + Math.abs(Math.sin(angle * 2)) * 1.5;

        data.push({
            position: { x, y, z },
            rotation: { x: 0, y: rotationY, z: 0 },
            scale: scale // 统一缩放
        });
    }

    return data;
};

// 创建实例化模型
const createInstancedModel = async () => {
    isLoading.value = true;
    loadProgress.value = 0;

    const config = {
        modelUrl: '/models/kache.glb',
        instanceCount: instanceConfig.instanceCount,
        layout: instanceConfig.layout,
        gridSize: instanceConfig.gridSize,
        spacing: instanceConfig.spacing,
        normalColor: parseInt(instanceConfig.normalColor.replace('#', '0x')),
        hoverColor: parseInt(instanceConfig.hoverColor.replace('#', '0x')),
        clickedColor: parseInt(instanceConfig.clickedColor.replace('#', '0x')),
        enableInteraction: true
    };

    // 如果是自定义布局，添加实例数据
    if (instanceConfig.layout === 'custom') {
        config.instancesData = generateCustomInstancesData();
    }

    instancedModel = await scene.add('InstancedModel', config);

    // 监听加载进度
    instancedModel.on('loadProgress', (data) => {
        loadProgress.value = data.percent;
    });

    // 监听加载完成
    instancedModel.on('loadComplete', (data) => {
        isLoading.value = false;
        addLog(`模型加载完成，实例数量: ${data.instanceCount}`);
    });

    // 监听加载错误
    instancedModel.on('loadError', (data) => {
        isLoading.value = false;
        addLog(`模型加载失败: ${data.error.message}`, 'error');
    });

    // 监听实例点击事件
    instancedModel.on('instanceClick', (data) => {
        clickedCount.value = data.clickedCount;
        addLog(
            `点击实例 #${data.index}, 位置: (${data.position.x.toFixed(
                1
            )}, ${data.position.y.toFixed(1)}, ${data.position.z.toFixed(1)})`
        );
    });

    // 监听鼠标进入事件
    instancedModel.on('instanceMouseEnter', (data) => {
        // addLog(`悬停实例 #${data.index}`);
    });

    // 监听鼠标离开事件
    instancedModel.on('instanceMouseLeave', (data) => {
        // addLog(`离开实例 #${data.index}`);
    });
};

// 重新创建实例
const recreateInstances = async () => {
    if (!instancedModel) return;

    await instancedModel.updateConfig({
        instanceCount: instanceConfig.instanceCount,
        layout: instanceConfig.layout,
        gridSize: instanceConfig.gridSize,
        spacing: instanceConfig.spacing
    });

    clickedCount.value = 0;
    addLog(`重新创建实例，数量: ${instanceConfig.instanceCount}, 布局: ${instanceConfig.layout}`);
};

// 更新颜色
const updateColors = async () => {
    if (!instancedModel) return;

    await instancedModel.updateConfig({
        normalColor: parseInt(instanceConfig.normalColor.replace('#', '0x'))
    });

    addLog('更新默认颜色');
};

// 重置所有颜色
const resetAllColors = () => {
    if (!instancedModel) return;

    instancedModel.resetAllColors();
    clickedCount.value = 0;
    addLog('重置所有颜色');
};

// 添加日志
const addLog = (message, type = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    eventLogs.value.unshift({
        time,
        message,
        type
    });

    // 限制日志数量
    if (eventLogs.value.length > maxLogs) {
        eventLogs.value.pop();
    }
};

// FPS 监控
let fpsUpdateInterval = null;
const startFPSMonitor = () => {
    let lastTime = performance.now();
    let frames = 0;

    const updateFPS = () => {
        frames++;
        const currentTime = performance.now();
        const delta = currentTime - lastTime;

        if (delta >= 1000) {
            fps.value = Math.round((frames * 1000) / delta);
            frames = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(updateFPS);
    };

    updateFPS();
};

// 源代码示例
const sourceCode = `// ========== InstancedModel 实例化模型组件示例 ==========

import { Scene } from '@w3d/core';
import { InstancedModel, GridHelper } from '@w3d/components';

// 创建场景
const scene = new Scene('#app');
scene.init();

// 注册组件
scene.registerComponent('InstancedModel', InstancedModel);
scene.registerComponent('GridHelper', GridHelper);

// 设置相机位置
scene.camera.setPosition(0, 50, 100);
scene.camera.lookAt(0, 0, 0);

// 添加网格辅助
await scene.add('GridHelper', {
  size: 200,
  divisions: 20,
  colorCenterLine: 0x444444,
  colorGrid: 0x222222
});

// ========== 创建实例化模型 ==========

const instancedModel = await scene.add('InstancedModel', {
  // 模型文件路径
  modelUrl: 'models/kache.glb',

  // 实例数量
  instanceCount: 1000,

  // 布局方式：'grid'（网格）、'random'（随机）、'custom'（自定义）
  layout: 'grid',

  // 网格布局的范围
  gridSize: { x: 100, z: 100 },

  // 网格布局的间距
  spacing: { x: 10, z: 10 },

  // 颜色配置
  normalColor: 0x00ff00,    // 默认颜色（绿色）
  hoverColor: 0xffff00,     // 鼠标悬停颜色（黄色）
  clickedColor: 0xff0000,   // 点击后颜色（红色）

  // 是否启用鼠标交互
  enableInteraction: true
});

// ========== 使用自定义实例数据 ==========

// 创建自定义实例数据数组
const customInstancesData = [];
for (let i = 0; i < 50; i++) {
  const angle = (i / 50) * Math.PI * 2;
  const radius = 30;

  customInstancesData.push({
    position: {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle * 3) * 5,
      z: Math.sin(angle) * radius
    },
    rotation: {
      x: 0,
      y: angle + Math.PI,  // 朝向圆心
      z: 0
    },
    scale: 0.5 + Math.abs(Math.sin(angle * 2)) * 1.5  // 统一缩放
    // 或者使用分量缩放：
    // scale: { x: 1.5, y: 1.0, z: 1.5 }
  });
}

// 使用自定义数据创建实例
const customInstancedModel = await scene.add('InstancedModel', {
  modelUrl: 'models/kache.glb',
  instancesData: customInstancesData,  // 传入自定义实例数据
  normalColor: 0x00ff00,
  hoverColor: 0xffff00,
  clickedColor: 0xff0000,
  enableInteraction: true
});

// ========== 监听事件 ==========

// 监听加载进度
instancedModel.on('loadProgress', (data) => {
  console.log('加载进度:', data.percent + '%');
});

// 监听加载完成
instancedModel.on('loadComplete', (data) => {
  console.log('模型加载完成，实例数量:', data.instanceCount);
});

// 监听加载错误
instancedModel.on('loadError', (data) => {
  console.error('模型加载失败:', data.error);
});

// 监听实例点击事件
instancedModel.on('instanceClick', (data) => {
  console.log('点击实例:', {
    index: data.index,
    position: data.position,
    clickedCount: data.clickedCount
  });
});

// 监听鼠标进入事件
instancedModel.on('instanceMouseEnter', (data) => {
  console.log('鼠标进入实例:', data.index);
});

// 监听鼠标离开事件
instancedModel.on('instanceMouseLeave', (data) => {
  console.log('鼠标离开实例:', data.index);
});

// ========== 动态更新配置 ==========

// 更新实例数量和布局
await instancedModel.updateConfig({
  instanceCount: 2000,
  layout: 'random'
});

// 更新颜色
await instancedModel.updateConfig({
  normalColor: 0x0000ff
});

// 重置所有颜色
instancedModel.resetAllColors();

// ========== 手动更新单个实例 ==========

// 更新指定实例的变换
instancedModel.updateInstanceTransform(
  0,  // 实例索引
  { x: 10, y: 0, z: 10 },  // 位置
  { x: 0, y: Math.PI / 4, z: 0 },  // 旋转
  { x: 1.5, y: 1.5, z: 1.5 }  // 缩放
);

// 更新指定实例的颜色
instancedModel.updateInstanceColor(0, 0xff00ff);

// 重置指定实例的颜色
instancedModel.resetInstanceColor(0);

// ========== 技术要点 ==========
// 1. 使用 THREE.InstancedMesh 渲染大量相同模型，性能优异
// 2. 支持网格布局、随机布局和自定义数据布局
// 3. 支持通过 instancesData 参数传入自定义的位置、旋转、缩放数据
// 4. 每个实例可以有独立的变换矩阵（位置、旋转、缩放）
// 5. 支持鼠标交互（悬停、点击），实时颜色反馈
// 6. 使用 Raycaster 进行高效的射线检测
// 7. 支持动态更新实例数量、布局和颜色
// 8. 完善的事件系统，方便监听各种交互事件
// 9. 自动资源管理，组件销毁时自动清理资源`;

// 组件挂载
onMounted(() => {
    initScene();
});

// 组件卸载
onUnmounted(() => {
    if (fpsUpdateInterval) {
        clearInterval(fpsUpdateInterval);
    }
    if (scene) {
        scene.dispose();
    }
});
</script>

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: calc(100vh - 40px);
    background: rgba(0, 0, 0, 0.85);
    padding: 20px;
    border-radius: 8px;
    color: white;
    overflow-y: auto;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.panel-title {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 2px solid #00ff00;
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
    margin: 0 0 12px 0;
    font-size: 15px;
    color: #00ff00;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    color: #ccc;
}

.form-group input[type='range'] {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
}

.form-group input[type='range']::-webkit-slider-thumb {
    width: 14px;
    height: 14px;
    background: #00ff00;
    border-radius: 50%;
    cursor: pointer;
}

.form-group input[type='color'] {
    width: 100%;
    height: 32px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.form-group select {
    width: 100%;
    padding: 6px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 13px;
}

.form-group select option {
    background: #222;
}

.btn-primary {
    padding: 8px 16px;
    background: #00ff00;
    color: #000;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #00cc00;
}

.btn-danger {
    padding: 8px 16px;
    background: #ff0000;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    transition: background 0.2s;
}

.btn-danger:hover {
    background: #cc0000;
}

/* 加载指示器 */
.loading-indicator {
    text-align: center;
    padding: 20px;
}

.spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 10px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: #00ff00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 性能统计 */
.stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.stat-label {
    color: #999;
    font-size: 12px;
}

.stat-value {
    color: #00ff00;
    font-weight: bold;
    font-size: 13px;
}

/* 事件日志 */
.event-log {
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
}

.log-item {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    font-size: 11px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-item:last-child {
    border-bottom: none;
}

.log-time {
    color: #666;
    flex-shrink: 0;
}

.log-message {
    color: #ccc;
    flex: 1;
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
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.event-log::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>
