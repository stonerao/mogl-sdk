<template>
    <SplitLayout :code="sourceCode" language="javascript" title="09 - 三维地图 (3D Map)">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">地图控制</h3>

            <!-- 地图选择 -->
            <div class="control-group">
                <label>选择地图:</label>
                <select v-model="selectedMap" @change="changeMap" class="control-select">
                    <option value="world">世界地图</option>
                    <option value="china">中国地图</option>
                    <option value="sichuan">四川省</option>
                </select>
            </div>

            <!-- 入场动画 -->
            <div class="control-group">
                <label>入场动画:</label>
                <select v-model="entryType" @change="updateEntryType" class="control-select">
                    <option :value="0">无</option>
                    <option :value="1">缩放</option>
                    <option :value="2">翻滚</option>
                    <option :value="3">拉伸</option>
                </select>
            </div>

            <!-- 轮播控制 -->
            <div class="control-group">
                <label>
                    <input type="checkbox" v-model="carouselEnabled" @change="toggleCarousel" />
                    启用轮播
                </label>
            </div>

            <!-- 侧面高度 -->
            <div class="control-group">
                <label>侧面高度: {{ sideHeight }}</label>
                <input
                    type="range"
                    v-model.number="sideHeight"
                    @input="updateSideHeight"
                    min="0"
                    max="20"
                    step="1"
                    class="control-slider"
                />
            </div>

            <!-- 区块颜色 -->
            <div class="control-group">
                <label>区块颜色:</label>
                <input
                    type="color"
                    v-model="blockColor"
                    @change="updateBlockColor"
                    class="control-color"
                />
            </div>

            <!-- 信息显示 -->
            <div class="info-section">
                <h4>地图信息</h4>
                <div class="info-item">
                    <span>区域数量:</span>
                    <span class="value">{{ areaCount }}</span>
                </div>
                <div class="info-item" v-if="currentArea">
                    <span>当前区域:</span>
                    <span class="value">{{ currentArea }}</span>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="button-group">
                <button @click="resetCamera" class="control-button">重置相机</button>
                <button @click="toggleMap" class="control-button">
                    {{ mapVisible ? '隐藏' : '显示' }}地图
                </button>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { SvgMap3D } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const selectedMap = ref('china');
const entryType = ref(1);
const carouselEnabled = ref(false);
const sideHeight = ref(4);
const blockColor = ref('#257df9');
const areaCount = ref(0);
const currentArea = ref('');
const mapVisible = ref(true);

let scene = null;
let mapComponent = null;

// 地图数据配置
const mapConfigs = {
    world: {
        url: '/svg/map/world.json',
        name: '世界地图',
        camera: { x: 0, y: 100, z: 100 }
    },
    china: {
        url: '/svg/map/990001.json',
        name: '中国地图',
        camera: { x: 0, y: 100, z: 100 }
    },
    sichuan: {
        url: '/svg/map/四川省.json',
        name: '四川省',
        camera: { x: 0, y: 100, z: 100 }
    }
};

// 源代码
const sourceCode = `import { Scene } from '@w3d/core';
import { SvgMap3D } from '@w3d/components';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    alpha: true
  },
  camera: {
    fov: 45,
    position: [0, 400, 300],
    lookAt: [0, 0, 0]
  }
});

scene.init();

// 添加灯光
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.8
});

scene.light.addDirectional({
  color: '#ffffff',
  intensity: 1.0,
  position: [100, 200, 100]
});

// 注册地图组件
scene.registerComponent('SvgMap3D', SvgMap3D);

// 添加地图
const map = await scene.add('SvgMap3D', {
  name: 'worldMap',
  camera: {
    fov: 30,
    position: { x: 0, y: 600, z: 500 }
  },
  mapConfig: {
    areaBlock: {
      blockColor: ['rgba(37, 125, 249, 0.8)'],
      borderColor: 'rgba(0, 63, 155, 0.51)',
      borderGlow: 'rgba(255, 251, 220, 0.51)',
      borderWidth: 1,
      showOutLine: true,
      outlineColor: 'rgba(0, 63, 155, 0.51)',
      outlineWidth: 2,
      isBlockRaise: true,
      raiseHeight: 2,
      sideHeight: 4,
      sideColor: ['rgba(159, 239, 241, 0.9)']
    },
    interaction: {
      isInteract: true,
      blockHover: ['rgba(255, 255, 255, 0.8)'],
      borderHover: '#33e0ff'
    },
    dynamic: {
      entryType: 1,
      entrySpeed: 1.5,
      carousel: false,
      carouTime: 3
    }
  }
});

// 监听事件
map.on('dataLoaded', (data) => {
  console.log('地图加载完成', data);
});

map.on('carousel', (area) => {
  console.log('轮播到:', area.name);
});

// 加载地图数据
await map.setMapData('/svg/map/990001.json');

// 启动渲染
scene.start();

console.log('🗺️ 三维地图示例');`;

onMounted(() => {
    initScene();
});

onUnmounted(() => {
    cleanup();
});

const initScene = async () => {
    if (!sceneContainer.value) return;

    // 创建场景
    scene = new Scene(sceneContainer.value, {
        renderer: {
            antialias: true,
            alpha: true
        },
        camera: {
            fov: 45,
            position: [0, 400, 300],
            lookAt: [0, 0, 0]
        }
    });

    scene.init();

    // 添加灯光
    scene.light.addAmbient({
        color: '#ffffff',
        intensity: 0.8
    });

    scene.light.addDirectional({
        color: '#ffffff',
        intensity: 1.0,
        position: [100, 200, 100]
    });

    // 启用自动调整大小
    scene.renderer.enableResize();

    // 注册地图组件
    scene.registerComponent('SvgMap3D', SvgMap3D);

    // 加载地图
    await loadMap(selectedMap.value);

    // 启动渲染
    scene.start();

    console.log('🗺️ 三维地图示例 - Vue 3');
};

const loadMap = async (mapKey) => {
    const config = mapConfigs[mapKey];

    if (!config) {
        console.error('地图配置不存在:', mapKey);
        return;
    }

    // 移除旧地图
    if (mapComponent) {
        scene.remove(mapComponent);
        mapComponent = null;
    }

    try {
        // 添加新地图
        mapComponent = await scene.add('SvgMap3D', {
            name: config.name,
            camera: {
                fov: 30,
                position: config.camera
            },
            mapConfig: {
                areaBlock: {
                    blockColor: [hexToRgba(blockColor.value, 0.8)],
                    borderColor: 'rgba(0, 63, 155, 0.51)',
                    borderGlow: 'rgba(255, 251, 220, 0.51)',
                    borderWidth: 1,
                    showOutLine: true,
                    outlineColor: 'rgba(0, 63, 155, 0.51)',
                    outlineWidth: 2,
                    isBlockRaise: true,
                    raiseHeight: 2,
                    sideHeight: sideHeight.value,
                    sideColor: ['rgba(159, 239, 241, 0.9)']
                },
                interaction: {
                    isInteract: true,
                    enableClick: true,
                    enableHover: true,
                    blockHover: ['rgba(255, 255, 255, 0.8)'],
                    borderHover: '#33e0ff'
                },
                label: {
                    show: true,
                    fontSize: 14,
                    fontFamily: 'Arial, Microsoft YaHei, sans-serif',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    outlineWidth: 2,
                    outlineColor: '#000000',
                    height: 2,
                    visible: true
                },
                dynamic: {
                    entryType: entryType.value,
                    entrySpeed: 1.5,
                    carousel: carouselEnabled.value,
                    carouTime: 3
                }
            }
        });

        // 监听事件
        mapComponent.on('dataLoaded', (data) => {
            console.log('地图加载完成', data);
            if (data && data.series) {
                areaCount.value = data.series.length;
            }
        });

        mapComponent.on('carousel', (area) => {
            console.log('轮播到:', area.name);
            currentArea.value = area.name;
        });

        // 监听交互事件
        mapComponent.on('click', (data) => {
            console.log('✅ 点击了区域:', data.area.name);
            currentArea.value = data.area.name;
        });

        mapComponent.on('mouseenter', (data) => {
            console.log('🖱️ 鼠标移入:', data.area.name);
            currentArea.value = data.area.name;
            // 改变鼠标样式
            if (sceneContainer.value) {
                sceneContainer.value.style.cursor = 'pointer';
            }
        });

        mapComponent.on('mouseleave', (data) => {
            console.log('👋 鼠标移出:', data.area.name);
            // 恢复鼠标样式
            if (sceneContainer.value) {
                sceneContainer.value.style.cursor = 'default';
            }
        });

        // 加载地图数据
        await mapComponent.setMapData(config.url);
    } catch (error) {
        console.error('加载地图失败:', error);
    }
};

const changeMap = async () => {
    await loadMap(selectedMap.value);
};

const updateEntryType = () => {
    if (mapComponent && mapComponent.config.mapConfig) {
        mapComponent.config.mapConfig.dynamic.entryType = entryType.value;
    }
};

const toggleCarousel = () => {
    if (mapComponent && mapComponent.config.mapConfig) {
        mapComponent.config.mapConfig.dynamic.carousel = carouselEnabled.value;
    }
};

const updateSideHeight = () => {
    // 需要重新加载地图以应用新的侧面高度
    // 这里简化处理，实际应该提供动态更新方法
};

const updateBlockColor = () => {
    // 需要重新加载地图以应用新的颜色
    // 这里简化处理，实际应该提供动态更新方法
};

const resetCamera = () => {
    if (scene && scene.camera) {
        const config = mapConfigs[selectedMap.value];
        scene.camera.instance.position.set(config.camera.x, config.camera.y, config.camera.z);
        if (scene.controls) {
            scene.controls.instance.target.set(0, 0, 0);
            scene.controls.instance.update();
        }
    }
};

const toggleMap = async () => {
    if (!mapComponent) return;

    if (mapVisible.value) {
        await mapComponent.hide(0.5);
        mapVisible.value = false;
    } else {
        await mapComponent.show(0.5);
        mapVisible.value = true;
    }
};

const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const cleanup = () => {
    console.log('Cleaning up Map3D example');
    if (scene) {
        scene.dispose();
        scene = null;
    }
    mapComponent = null;
};
</script>

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, #0a0e27 0%, #1a1e3e 100%);
}

.control-panel {
    position: absolute;
    top: 60px;
    right: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-size: 14px;
    min-width: 280px;
    max-width: 320px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.panel-title {
    font-size: 18px;
    margin-bottom: 16px;
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 8px;
    font-weight: 600;
}

.control-group {
    margin: 16px 0;
}

.control-group label {
    display: block;
    margin-bottom: 8px;
    opacity: 0.9;
    font-size: 13px;
}

.control-select,
.control-slider,
.control-color {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 13px;
}

.control-select {
    cursor: pointer;
}

.control-select option {
    background: #1a1e3e;
    color: white;
}

.control-slider {
    padding: 0;
    height: 6px;
    cursor: pointer;
}

.control-color {
    height: 40px;
    cursor: pointer;
}

.info-section {
    margin: 20px 0;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.info-section h4 {
    font-size: 14px;
    margin-bottom: 10px;
    color: var(--primary-color);
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    font-size: 13px;
}

.info-item span:first-child {
    opacity: 0.8;
}

.info-item .value {
    font-weight: bold;
    color: var(--success-color);
    font-family: 'Consolas', monospace;
}

.button-group {
    display: flex;
    gap: 10px;
    margin-top: 16px;
}

.control-button {
    flex: 1;
    padding: 10px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s;
}

.control-button:hover {
    background: var(--primary-hover-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(37, 125, 249, 0.4);
}

.control-button:active {
    transform: translateY(0);
}
</style>

