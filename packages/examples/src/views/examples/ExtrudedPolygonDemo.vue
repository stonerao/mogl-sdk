<template>
    <SplitLayout :code="sourceCode" language="javascript" :title="$t('extrudedPolygon.title')">
        <div ref="sceneContainer" class="scene-container">
            <GuiPanel :title="$t('extrudedPolygon.controls')">
                <GuiSection :title="$t('extrudedPolygon.presetShapes')">
                    <GuiSelect
                        :label="$t('extrudedPolygon.selectShape')"
                        v-model="selectedPreset"
                        @change="changePreset"
                        :options="[
                            { value: 'rectangle', label: $t('extrudedPolygon.rectangle') },
                            { value: 'pentagon', label: $t('extrudedPolygon.pentagon') },
                            { value: 'hexagon', label: $t('extrudedPolygon.hexagon') },
                            { value: 'star', label: $t('extrudedPolygon.star') },
                            { value: 'custom', label: $t('extrudedPolygon.custom') }
                        ]"
                    />
                </GuiSection>

                <GuiSection :title="$t('extrudedPolygon.extrudeSettings')">
                    <GuiSlider
                        :label="$t('extrudedPolygon.height')"
                        v-model="polygonConfig.height"
                        @change="updatePolygon"
                        :min="1"
                        :max="20"
                        :step="0.5"
                        :precision="1"
                    />
                </GuiSection>

                <GuiSection title="侧面配置（拉伸的垂直面）">
                    <GuiCheckbox
                        label="启用侧面纹理"
                        :modelValue="!!polygonConfig.side.textureUrl"
                        @update:modelValue="
                            (val) => {
                                polygonConfig.side.textureUrl = val ? '/images/n_2.jpg' : null;
                                updatePolygon();
                            }
                        "
                    />

                    <template v-if="polygonConfig.side.textureUrl">
                        <GuiSlider
                            label="侧面纹理重复 (U)"
                            v-model="polygonConfig.side.textureRepeat[0]"
                            @change="updatePolygon"
                            :min="1"
                            :max="10"
                            :step="1"
                        />
                        <GuiSlider
                            label="侧面纹理重复 (V)"
                            v-model="polygonConfig.side.textureRepeat[1]"
                            @change="updatePolygon"
                            :min="1"
                            :max="10"
                            :step="1"
                        />
                    </template>

                    <template v-if="!polygonConfig.side.textureUrl">
                        <GuiCheckbox
                            label="启用侧面渐变"
                            v-model="polygonConfig.side.useGradient"
                            @change="updatePolygon"
                        />
                        <GuiColorPicker
                            label="侧面底部颜色"
                            v-model="polygonConfig.side.bottomColor"
                            @change="updatePolygon"
                        />
                        <GuiColorPicker
                            v-if="polygonConfig.side.useGradient"
                            label="侧面顶部颜色"
                            v-model="polygonConfig.side.topColor"
                            @change="updatePolygon"
                        />
                    </template>
                </GuiSection>

                <GuiSection title="正面配置（底部和顶部平面）">
                    <GuiCheckbox
                        label="启用正面纹理"
                        :modelValue="!!polygonConfig.face.textureUrl"
                        @update:modelValue="
                            (val) => {
                                polygonConfig.face.textureUrl = val ? '/images/n_2.jpg' : null;
                                updatePolygon();
                            }
                        "
                    />

                    <template v-if="polygonConfig.face.textureUrl">
                        <GuiSlider
                            label="正面纹理重复 (U)"
                            v-model="polygonConfig.face.textureRepeat[0]"
                            @change="updatePolygon"
                            :min="1"
                            :max="10"
                            :step="1"
                        />
                        <GuiSlider
                            label="正面纹理重复 (V)"
                            v-model="polygonConfig.face.textureRepeat[1]"
                            @change="updatePolygon"
                            :min="1"
                            :max="10"
                            :step="1"
                        />
                    </template>

                    <template v-if="!polygonConfig.face.textureUrl">
                        <GuiCheckbox
                            label="启用正面渐变"
                            v-model="polygonConfig.face.useGradient"
                            @change="updatePolygon"
                        />
                        <GuiColorPicker
                            label="正面底部颜色"
                            v-model="polygonConfig.face.bottomColor"
                            @change="updatePolygon"
                        />
                        <GuiColorPicker
                            v-if="polygonConfig.face.useGradient"
                            label="正面顶部颜色"
                            v-model="polygonConfig.face.topColor"
                            @change="updatePolygon"
                        />
                        <GuiSlider
                            v-if="polygonConfig.face.useGradient"
                            label="正面渐变角度"
                            v-model="polygonConfig.face.gradientAngle"
                            @change="updatePolygon"
                            :min="0"
                            :max="360"
                            :step="15"
                            suffix="°"
                        />
                    </template>
                </GuiSection>

                <GuiSection :title="$t('extrudedPolygon.materialSettings')">
                    <GuiSlider
                        :label="$t('extrudedPolygon.opacity')"
                        v-model="polygonConfig.opacity"
                        @change="updatePolygon"
                        :min="0.1"
                        :max="1"
                        :step="0.05"
                        :precision="2"
                    />
                    <GuiCheckbox
                        :label="$t('extrudedPolygon.wireframe')"
                        v-model="polygonConfig.wireframe"
                        @change="updatePolygon"
                    />
                </GuiSection>

                <GuiSection :title="$t('extrudedPolygon.stats')">
                    <GuiInfoItem :label="$t('extrudedPolygon.vertices')" :value="stats.vertices" />
                    <GuiInfoItem :label="$t('extrudedPolygon.faces')" :value="stats.faces" />
                </GuiSection>

                <GuiSection title="事件日志">
                    <div class="event-log">
                        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                            {{ log }}
                        </div>
                    </div>
                </GuiSection>
            </GuiPanel>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Scene } from '@w3d/core';
import { ExtrudedPolygon, GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiColorPicker,
    GuiSelect,
    GuiCheckbox,
    GuiInfoItem
} from '@/components/Gui';

const { t } = useI18n();

// 场景容器引用
const sceneContainer = ref(null);

// 事件日志
const eventLogs = ref([]);

// 统计信息
const stats = reactive({
    vertices: 0,
    faces: 0
});

// W3D 场景实例
let scene = null;

// ExtrudedPolygon 组件实例
let extrudedPolygon = null;

// 预设形状选择
const selectedPreset = ref('rectangle');

// 多边形配置（新的配置结构）
const polygonConfig = reactive({
    height: 10,

    // 侧面配置
    side: {
        textureUrl: null, // 侧面纹理 URL
        textureRepeat: [1, 1], // 侧面纹理重复次数
        useGradient: true, // 是否启用侧面渐变
        bottomColor: '#00ff00', // 侧面底部颜色
        topColor: '#0000ff' // 侧面顶部颜色
    },

    // 正面配置
    face: {
        textureUrl: '/images/n_2.jpg', // 正面纹理 URL
        textureRepeat: [2, 2], // 正面纹理重复次数
        useGradient: false, // 是否启用正面渐变
        bottomColor: '#ff0000', // 正面底部颜色
        topColor: '#ffff00', // 正面顶部颜色
        gradientAngle: 0 // 正面渐变角度（度）
    },

    // 材质配置
    opacity: 1.0,
    wireframe: false,
    sideMaterialType: 'standard',
    faceMaterialType: 'standard'
});

// 预设形状点位数据
const presets = {
    rectangle: [
        [-10, 0],
        [10, 0],
        [10, 20],
        [-10, 20]
    ],
    pentagon: generateRegularPolygon(5, 10),
    hexagon: generateRegularPolygon(6, 10),
    star: generateStar(5, 10, 5),
    custom: [
        [0, 0],
        [15, 5],
        [12, 15],
        [5, 20],
        [-5, 15],
        [-10, 5]
    ]
};

// 添加日志
const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 50) {
        eventLogs.value.pop();
    }
};

// 更新统计信息
const updateStats = () => {
    if (extrudedPolygon && extrudedPolygon.geometry) {
        stats.vertices = extrudedPolygon.geometry.attributes.position.count;
        stats.faces = extrudedPolygon.geometry.index
            ? extrudedPolygon.geometry.index.count / 3
            : stats.vertices / 3;
    }
};

// 生成正多边形点位
function generateRegularPolygon(sides, radius) {
    const points = [];
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    return points;
}

// 生成星形点位
function generateStar(points, outerRadius, innerRadius) {
    const vertices = [];
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    return vertices;
}

// 初始化场景
const initScene = async () => {
    // 创建场景
    scene = new Scene(sceneContainer.value, {
        renderer: {
            antialias: true,
            outputColorSpace: 'srgb'
        },
        camera: {
            fov: 45,
            position: [30, 30, 30],
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
        position: [10, 10, 5]
    });

    // 注册组件
    scene.registerComponent('ExtrudedPolygon', ExtrudedPolygon);
    scene.registerComponent('GridHelper', GridHelper);

    // 添加网格
    await scene.add('GridHelper', {
        name: 'grid',
        size: 40,
        divisions: 40,
        colorCenterLine: '#888888',
        colorGrid: '#444444'
    });

    // 创建拉伸多边形
    await createExtrudedPolygon();

    addLog('场景初始化完成');
};

// 创建拉伸多边形
const createExtrudedPolygon = async () => {
    const points = presets[selectedPreset.value];
    extrudedPolygon = await scene.add('ExtrudedPolygon', {
        points: points,
        height: polygonConfig.height,
        side: {
            textureUrl: polygonConfig.side.textureUrl,
            textureRepeat: polygonConfig.side.textureRepeat,
            useGradient: polygonConfig.side.useGradient,
            bottomColor: parseInt(polygonConfig.side.bottomColor.replace('#', '0x')),
            topColor: parseInt(polygonConfig.side.topColor.replace('#', '0x'))
        },
        face: {
            textureUrl: polygonConfig.face.textureUrl,
            textureRepeat: polygonConfig.face.textureRepeat,
            useGradient: polygonConfig.face.useGradient,
            bottomColor: parseInt(polygonConfig.face.bottomColor.replace('#', '0x')),
            topColor: parseInt(polygonConfig.face.topColor.replace('#', '0x')),
            gradientAngle: polygonConfig.face.gradientAngle
        },
        material: {
            side: 2, // THREE.DoubleSide
            transparent: polygonConfig.opacity < 1,
            opacity: polygonConfig.opacity,
            wireframe: polygonConfig.wireframe
        }
    });

    // 更新统计信息
    updateStats();

    addLog(`创建拉伸多边形: ${selectedPreset.value}`);
};

// 更新多边形
const updatePolygon = async () => {
    if (!extrudedPolygon) return;

    const points = presets[selectedPreset.value];

    await extrudedPolygon.updateConfig({
        points: points,
        height: polygonConfig.height,
        side: {
            textureUrl: polygonConfig.side.textureUrl,
            textureRepeat: polygonConfig.side.textureRepeat,
            useGradient: polygonConfig.side.useGradient,
            bottomColor: parseInt(polygonConfig.side.bottomColor.replace('#', '0x')),
            topColor: parseInt(polygonConfig.side.topColor.replace('#', '0x'))
        },
        face: {
            textureUrl: polygonConfig.face.textureUrl,
            textureRepeat: polygonConfig.face.textureRepeat,
            useGradient: polygonConfig.face.useGradient,
            bottomColor: parseInt(polygonConfig.face.bottomColor.replace('#', '0x')),
            topColor: parseInt(polygonConfig.face.topColor.replace('#', '0x')),
            gradientAngle: polygonConfig.face.gradientAngle
        },
        material: {
            side: 2,
            transparent: polygonConfig.opacity < 1,
            opacity: polygonConfig.opacity,
            wireframe: polygonConfig.wireframe
        }
    });

    // 更新统计信息
    updateStats();

    addLog('多边形配置已更新');
};

// 切换预设形状
const changePreset = async () => {
    addLog(`切换形状: ${selectedPreset.value}`);
    await updatePolygon();
};

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { ExtrudedPolygon, GridHelper } from '@w3d/components';

// ========== 1. 创建场景 ==========
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [30, 30, 30],
    lookAt: [0, 0, 0]
  }
});

scene.init();

// ========== 2. 添加灯光 ==========
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.6
});

scene.light.addDirectional({
  color: '#ffffff',
  intensity: 0.8,
  position: [10, 10, 5]
});

// ========== 3. 注册组件 ==========
scene.registerComponent('ExtrudedPolygon', ExtrudedPolygon);
scene.registerComponent('GridHelper', GridHelper);

// ========== 4. 添加网格辅助器 ==========
await scene.add('GridHelper', {
  name: 'grid',
  size: 40,
  divisions: 40
});

// ========== 5. 创建拉伸多边形（新的配置结构）==========
const polygon = await scene.add('ExtrudedPolygon', {
  // 点位数据（2D 格式：[[x, y], ...]）
  points: [[-10, 0], [10, 0], [10, 20], [-10, 20]],

  // 拉伸高度
  height: 10,

  // 侧面配置（拉伸的垂直面）
  side: {
    // 纹理模式
    textureUrl: '/images/side-texture.jpg',  // 侧面纹理图片路径
    textureRepeat: [1, 1],                   // 侧面纹理重复次数 [U, V]（默认 [1, 1] 铺满）

    // 或者使用渐变模式（当 textureUrl 为 null 时）
    useGradient: true,                       // 启用侧面渐变
    bottomColor: 0x00ff00,                   // 侧面底部颜色（绿色）
    topColor: 0x0000ff                       // 侧面顶部颜色（蓝色）
  },

  // 正面配置（底部和顶部的 2D 多边形平面）
  face: {
    // 纹理模式
    textureUrl: '/images/face-texture.jpg',  // 正面纹理图片路径
    textureRepeat: [2, 2],                   // 正面纹理重复次数 [U, V]

    // 或者使用颜色模式（当 textureUrl 为 null 时）
    useGradient: false,                      // 启用正面渐变
    bottomColor: 0xff0000,                   // 正面底部颜色（红色）
    topColor: 0xffff00,                      // 正面顶部颜色（黄色）
    gradientAngle: 0                         // 正面渐变角度（度），0° = 垂直，90° = 水平
  },

  // 材质配置
  material: {
    side: 2,              // 双面渲染（THREE.DoubleSide）
    transparent: false,   // 不透明
    opacity: 1.0,         // 完全不透明
    wireframe: false      // 非线框模式
  }
});

// ========== 6. 动态更新配置示例 ==========
// 示例 1: 更新侧面为纹理模式
await polygon.updateConfig({
  side: {
    textureUrl: '/images/new-side-texture.jpg',
    textureRepeat: [3, 2]
  }
});

// 示例 2: 更新侧面为渐变模式
await polygon.updateConfig({
  side: {
    textureUrl: null,      // 禁用纹理
    useGradient: true,     // 启用渐变
    bottomColor: 0xff0000,
    topColor: 0x00ff00
  }
});

// 示例 3: 更新正面为纹理模式
await polygon.updateConfig({
  face: {
    textureUrl: '/images/new-face-texture.jpg',
    textureRepeat: [4, 4]
  }
});

// 示例 4: 更新正面为纯色模式
await polygon.updateConfig({
  face: {
    textureUrl: null,      // 禁用纹理
    useGradient: false,    // 禁用渐变
    bottomColor: 0x0000ff  // 使用纯色
  }
});

// ========== 材质应用说明 ==========
// 1. 侧面（拉伸的垂直面 - side faces）：
//    - 纹理模式：设置 side.textureUrl，可调整 side.textureRepeat
//      * 默认 [1, 1] 时，一张纹理正好铺满整个侧面
//      * UV 映射已优化，根据周长和高度自动计算
//    - 渐变模式：设置 side.textureUrl = null，启用 side.useGradient
//      * 垂直渐变，从底部颜色到顶部颜色
//    - 纯色模式：设置 side.textureUrl = null，禁用 side.useGradient
//
// 2. 正面（底部和顶部的 2D 多边形平面 - lid/cap faces）：
//    - 纹理模式：设置 face.textureUrl，可调整 face.textureRepeat
//    - 渐变模式：设置 face.textureUrl = null，启用 face.useGradient
//      * 支持渐变角度调整（face.gradientAngle）
//      * 0° = 垂直渐变，90° = 水平渐变，45° = 对角线渐变
//    - 纯色模式：设置 face.textureUrl = null，禁用 face.useGradient
//
// 3. 侧面和正面可以独立配置，互不干扰
// 4. 纹理重复次数（UV 密度）可以独立设置 [U, V] 方向
// 5. 正面渐变支持 0° - 360° 任意角度旋转`;

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

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.event-log {
    max-height: 150px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
    .scrollbar-style();
}

.log-item {
    font-size: 10px;
    color: #00ff00;
    margin-bottom: 4px;
    padding: 2px 0;
    border-bottom: 1px solid rgba(0, 255, 0, 0.1);

    &:last-child {
        border-bottom: none;
    }
}
</style>

