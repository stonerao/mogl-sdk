<template>
    <SplitLayout :code="sourceCode" language="javascript" title="Label3D - 三维标签组件">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">标签控制</h3>

            <!-- 标签列表 -->
            <div class="section">
                <h4>标签列表</h4>
                <div class="label-list">
                    <div
                        v-for="label in labelList"
                        :key="label.id"
                        class="label-item"
                        :class="{ active: selectedLabelId === label.id }"
                        @click="selectLabel(label.id)"
                    >
                        <span class="label-name">{{ label.label }}</span>
                        <div class="label-actions">
                            <button @click.stop="toggleLabelVisibility(label.id)" class="btn-small">
                                {{ label.visible ? '隐藏' : '显示' }}
                            </button>
                            <button
                                @click.stop="removeLabel(label.id)"
                                class="btn-small btn-danger"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 添加标签 -->
            <div class="section">
                <h4>添加标签</h4>
                <div class="form-group">
                    <label>标签文字:</label>
                    <input v-model="newLabelText" type="text" placeholder="输入标签文字" />
                </div>
                <button @click="addNewLabel" class="btn-primary">添加标签</button>
            </div>

            <!-- 全局样式配置 -->
            <div class="section">
                <h4>全局样式</h4>

                <div class="form-group">
                    <label>字体大小: {{ globalConfig.fontSize }}px</label>
                    <input
                        v-model.number="globalConfig.fontSize"
                        type="range"
                        min="16"
                        max="64"
                        @input="updateGlobalStyle"
                    />
                </div>

                <div class="form-group">
                    <label>文字颜色:</label>
                    <input
                        v-model="globalConfig.textColor"
                        type="color"
                        @input="updateGlobalStyle"
                    />
                </div>

                <div class="form-group">
                    <label>背景颜色:</label>
                    <input
                        v-model="globalConfig.backgroundColor"
                        type="color"
                        @input="updateGlobalStyle"
                    />
                </div>

                <div class="form-group">
                    <label>边框颜色:</label>
                    <input
                        v-model="globalConfig.borderColor"
                        type="color"
                        @input="updateGlobalStyle"
                    />
                </div>

                <div class="form-group">
                    <label>边框宽度: {{ globalConfig.borderWidth }}px</label>
                    <input
                        v-model.number="globalConfig.borderWidth"
                        type="range"
                        min="0"
                        max="10"
                        @input="updateGlobalStyle"
                    />
                </div>

                <div class="form-group">
                    <label>圆角半径: {{ globalConfig.borderRadius }}px</label>
                    <input
                        v-model.number="globalConfig.borderRadius"
                        type="range"
                        min="0"
                        max="20"
                        @input="updateGlobalStyle"
                    />
                </div>

                <div class="form-group">
                    <label>缩放: {{ globalConfig.scale.toFixed(1) }}</label>
                    <input
                        v-model.number="globalConfig.scale"
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        @input="updateGlobalStyle"
                    />
                </div>
            </div>

            <!-- 事件日志 -->
            <div class="section">
                <h4>事件日志</h4>
                <div class="event-log">
                    <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                        {{ log }}
                    </div>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { Label3D, GridHelper } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const selectedLabelId = ref(null);
const newLabelText = ref('新标签');
const eventLogs = ref([]);

let scene = null;
let labelComponent = null;
let labelCounter = 0;

// 标签列表
const labelList = ref([
    { id: 'label1', label: '建筑 A', visible: true },
    { id: 'label2', label: '建筑 B', visible: true },
    { id: 'label3', label: '建筑 C', visible: true },
    { id: 'label4', label: '停车场', visible: true },
    { id: 'label5', label: '公园', visible: true }
]);

// 全局配置
const globalConfig = reactive({
    fontSize: 32,
    textColor: '#ffffff',
    backgroundColor: '#000000',
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 5,
    scale: 1
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { Label3D, GridHelper } from '@w3d/components';
import * as THREE from 'three';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [20, 15, 20],
    lookAt: [0, 0, 0]
  }
});

// 初始化场景
scene.init();

// 添加灯光
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
scene.registerComponent('Label3D', Label3D);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格辅助
await scene.add('GridHelper', {
  name: 'grid',
  size: 30,
  divisions: 30
});

// 添加三维标签
const labels = await scene.add('Label3D', {
  name: 'my-labels',
  globalConfig: {
    fontSize: 32,
    fontFamily: 'Arial, sans-serif',
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: '#ffffff',
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    scale: 1,
    billboard: true
  },
  labels: [
    {
      id: 'label1',
      label: '建筑 A',
      position: { x: -8, y: 3, z: -8 },
      userData: { type: 'building', name: '建筑A' }
    },
    {
      id: 'label2',
      label: '建筑 B',
      position: { x: 8, y: 3, z: -8 },
      userData: { type: 'building', name: '建筑B' }
    },
    {
      id: 'label3',
      label: '建筑 C',
      position: { x: 0, y: 3, z: 8 },
      userData: { type: 'building', name: '建筑C' }
    }
  ]
});

// 监听点击事件
labels.on('click', (event) => {
  const labelId = event.object.userData.labelId;
  const customData = event.object.userData.customData;
  console.log('点击了标签:', labelId, customData);
});

// 监听鼠标移入事件
labels.on('mouseenter', (event) => {
  const sprite = event.object;
  sprite.scale.multiplyScalar(1.2);
  console.log('鼠标移入:', event.object.userData.labelId);
});

// 监听鼠标移出事件
labels.on('mouseleave', (event) => {
  const sprite = event.object;
  sprite.scale.divideScalar(1.2);
  console.log('鼠标移出:', event.object.userData.labelId);
});`;

// 添加事件日志
const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
    }
};

// 初始化场景
const initScene = async () => {
    if (!sceneContainer.value) return;

    try {
        // 创建场景
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [20, 15, 20],
                lookAt: [0, 0, 0]
            }
        });

        // 初始化场景
        scene.init();

        // 添加灯光
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
        scene.registerComponent('Label3D', Label3D);
        scene.registerComponent('GridHelper', GridHelper);

        // 添加网格辅助
        await scene.add('GridHelper', {
            name: 'grid',
            size: 30,
            divisions: 30,
            color: '#888888'
        });

        // 添加一些立方体作为参考
        createReferenceCubes();

        // 添加三维标签
        labelComponent = await scene.add('Label3D', {
            name: 'my-labels',
            globalConfig: {
                fontSize: globalConfig.fontSize,
                fontFamily: 'Arial, sans-serif',
                textColor: globalConfig.textColor,
                backgroundColor: hexToRgba(globalConfig.backgroundColor, 0.7),
                borderColor: globalConfig.borderColor,
                borderWidth: globalConfig.borderWidth,
                padding: 10,
                borderRadius: globalConfig.borderRadius,
                scale: globalConfig.scale,
                billboard: true,
                depthTest: true,
                sizeAttenuation: true
            },
            labels: [
                {
                    id: 'label1',
                    label: '建筑 A',
                    position: { x: -8, y: 3, z: -8 },
                    userData: { type: 'building', name: '建筑A' }
                },
                {
                    id: 'label2',
                    label: '建筑 B',
                    position: { x: 8, y: 3, z: -8 },
                    userData: { type: 'building', name: '建筑B' }
                },
                {
                    id: 'label3',
                    label: '建筑 C',
                    position: { x: 0, y: 3, z: 8 },
                    userData: { type: 'building', name: '建筑C' }
                },
                {
                    id: 'label4',
                    label: '停车场',
                    position: { x: -8, y: 1, z: 8 },
                    userData: { type: 'parking', name: '停车场' },
                    config: {
                        fontSize: 24,
                        textColor: '#ffff00',
                        backgroundColor: 'rgba(0, 100, 200, 0.8)'
                    }
                },
                {
                    id: 'label5',
                    label: '公园',
                    position: { x: 8, y: 1, z: 8 },
                    userData: { type: 'park', name: '公园' },
                    config: {
                        fontSize: 28,
                        textColor: '#00ff00',
                        backgroundColor: 'rgba(0, 150, 0, 0.8)'
                    }
                }
            ]
        });

        // 监听点击事件
        labelComponent.on('click', (event) => {
            const labelId = event.object.userData.labelId;
            const customData = event.object.userData.customData;
            selectedLabelId.value = labelId;
            addLog(`点击标签: ${labelId} - ${customData.name}`);
        });

        // 监听鼠标移入事件
        labelComponent.on('mouseenter', (event) => {
            const sprite = event.object;
            sprite.scale.multiplyScalar(1.2);
            addLog(`鼠标移入: ${event.object.userData.labelId}`);
        });

        // 监听鼠标移出事件
        labelComponent.on('mouseleave', (event) => {
            const sprite = event.object;
            sprite.scale.divideScalar(1.2);
            addLog(`鼠标移出: ${event.object.userData.labelId}`);
        });

        addLog('场景初始化完成');
    } catch (error) {
        console.error('初始化场景失败:', error);
        addLog(`错误: ${error.message}`);
    }
};

// 创建参考立方体
const createReferenceCubes = () => {
    const positions = [
        { x: -8, y: 1, z: -8, color: '#ff6b6b' },
        { x: 8, y: 1, z: -8, color: '#4ecdc4' },
        { x: 0, y: 1, z: 8, color: '#45b7d1' },
        { x: -8, y: 0.5, z: 8, color: '#ffd93d' },
        { x: 8, y: 0.5, z: 8, color: '#6bcf7f' }
    ];

    positions.forEach((pos) => {
        const geometry = new THREE.BoxGeometry(2, pos.y * 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: pos.color,
            metalness: 0.3,
            roughness: 0.7
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(pos.x, pos.y, pos.z);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.scene.add(cube);
    });
};

// 颜色转换辅助函数
const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 选择标签
const selectLabel = (id) => {
    selectedLabelId.value = id;
    addLog(`选择标签: ${id}`);
};

// 切换标签可见性
const toggleLabelVisibility = (id) => {
    const label = labelList.value.find((l) => l.id === id);
    if (label) {
        label.visible = !label.visible;
        if (label.visible) {
            labelComponent.showLabel(id);
            addLog(`显示标签: ${id}`);
        } else {
            labelComponent.hideLabel(id);
            addLog(`隐藏标签: ${id}`);
        }
    }
};

// 移除标签
const removeLabel = (id) => {
    labelComponent.removeLabel(id);
    const index = labelList.value.findIndex((l) => l.id === id);
    if (index > -1) {
        labelList.value.splice(index, 1);
    }
    addLog(`删除标签: ${id}`);
};

// 添加新标签
const addNewLabel = async () => {
    if (!newLabelText.value.trim()) {
        addLog('错误: 标签文字不能为空');
        return;
    }

    labelCounter++;
    const newId = `label-${Date.now()}-${labelCounter}`;

    // 随机位置
    const x = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;
    const y = Math.random() * 5 + 2;

    await labelComponent.createLabel({
        id: newId,
        label: newLabelText.value,
        position: { x, y, z },
        userData: { type: 'custom', name: newLabelText.value }
    });

    labelList.value.push({
        id: newId,
        label: newLabelText.value,
        visible: true
    });

    addLog(`添加标签: ${newLabelText.value}`);
    newLabelText.value = '新标签';
};

// 更新全局样式
const updateGlobalStyle = async () => {
    if (!labelComponent) return;

    // 更新所有标签的样式
    const allLabels = labelComponent.getAllLabels();
    for (const label of allLabels) {
        // 只更新没有自定义配置的标签
        if (!label.config || Object.keys(label.config).length === 0) {
            await labelComponent.updateLabel(label.id, {
                config: {
                    fontSize: globalConfig.fontSize,
                    textColor: globalConfig.textColor,
                    backgroundColor: hexToRgba(globalConfig.backgroundColor, 0.7),
                    borderColor: globalConfig.borderColor,
                    borderWidth: globalConfig.borderWidth,
                    borderRadius: globalConfig.borderRadius,
                    scale: globalConfig.scale
                }
            });
        }
    }

    addLog('更新全局样式');
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
    background: rgba(0, 0, 0, 0.8);
    padding: 20px;
    border-radius: 8px;
    color: white;
    max-width: 320px;
    max-height: calc(100% - 40px);
    overflow-y: auto;
    font-size: 14px;
}

.panel-title {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 2px solid #4ecdc4;
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
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #4ecdc4;
}

.label-list {
    max-height: 200px;
    overflow-y: auto;
}

.label-item {
    padding: 8px;
    margin-bottom: 5px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.label-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.label-item.active {
    background: rgba(78, 205, 196, 0.3);
    border: 1px solid #4ecdc4;
}

.label-name {
    flex: 1;
    font-size: 13px;
}

.label-actions {
    display: flex;
    gap: 5px;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    color: #aaa;
}

.form-group input[type='text'] {
    width: 100%;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 13px;
}

.form-group input[type='range'] {
    width: 100%;
}

.form-group input[type='color'] {
    width: 100%;
    height: 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-primary {
    width: 100%;
    padding: 8px 16px;
    background: #4ecdc4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #45b7d1;
}

.btn-small {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;
}

.btn-small:hover {
    background: rgba(255, 255, 255, 0.2);
}

.btn-danger {
    background: rgba(255, 107, 107, 0.3);
    border-color: #ff6b6b;
}

.btn-danger:hover {
    background: rgba(255, 107, 107, 0.5);
}

.event-log {
    max-height: 150px;
    overflow-y: auto;
    font-size: 11px;
    font-family: monospace;
}

.log-item {
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #aaa;
}

.log-item:last-child {
    border-bottom: none;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.label-list::-webkit-scrollbar,
.event-log::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.label-list::-webkit-scrollbar-track,
.event-log::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.label-list::-webkit-scrollbar-thumb,
.event-log::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.label-list::-webkit-scrollbar-thumb:hover,
.event-log::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>

