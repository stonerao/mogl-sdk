<template>
    <SplitLayout :code="sourceCode" language="javascript" title="09 - 三维地图 (3D Map)">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <GuiPanel title="地图控制" width="wide">
            <!-- 地图选择 -->
            <GuiSection title="地图选择">
                <GuiSelect
                    label="选择地图"
                    v-model="selectedMap"
                    :options="[
                        { value: 'world', label: '世界地图' },
                        { value: 'china', label: '中国地图' },
                        { value: 'sichuan', label: '四川省' }
                    ]"
                    @update:modelValue="changeMap"
                />

                <GuiSelect
                    label="入场动画"
                    v-model="entryType"
                    :options="[
                        { value: 0, label: '无' },
                        { value: 1, label: '缩放' },
                        { value: 2, label: '翻滚' },
                        { value: 3, label: '拉伸' }
                    ]"
                    @update:modelValue="updateEntryType"
                />
            </GuiSection>

            <!-- 配置选项 -->
            <GuiSection title="配置选项">
                <GuiCheckbox
                    label="启用轮播"
                    v-model="carouselEnabled"
                    @update:modelValue="toggleCarousel"
                />

                <GuiSlider
                    label="侧面高度"
                    v-model="sideHeight"
                    :min="0"
                    :max="20"
                    :step="1"
                    @update:modelValue="updateSideHeight"
                />

                <GuiColorPicker
                    label="区块颜色"
                    v-model="blockColor"
                    @update:modelValue="updateBlockColor"
                />
            </GuiSection>

            <!-- 信息显示 -->
            <GuiSection title="地图信息">
                <GuiInfoItem label="区域数量" :value="areaCount" />
                <template v-if="currentArea">
                    <GuiInfoItem label="当前区域" :value="currentArea" />
                </template>
            </GuiSection>

            <!-- 操作按钮 -->
            <GuiSection title="操作">
                <div class="button-group">
                    <GuiButton label="重置相机" @click="resetCamera" />
                    <GuiButton :label="mapVisible ? '隐藏地图' : '显示地图'" @click="toggleMap" />
                </div>
            </GuiSection>
        </GuiPanel>
    </SplitLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { SvgMap3D } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSelect,
    GuiCheckbox,
    GuiSlider,
    GuiColorPicker,
    GuiInfoItem,
    GuiButton
} from '@/components/Gui';
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

<style scoped lang="less">
@import '@/styles/gui.less';
.scene-container {
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, #0a0e27 0%, #1a1e3e 100%);
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>

