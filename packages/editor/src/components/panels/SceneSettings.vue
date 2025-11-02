<template>
    <div class="scene-settings">
        <div class="settings-content">
            <Accordion :items="accordionItems" :default-open="['renderer', 'camera', 'lighting']">
                <!-- 渲染器设置 -->
                <template #renderer>
                    <div class="settings-group">
                        <div class="setting-item-inline">
                            <label>抗锯齿</label>
                            <input
                                type="checkbox"
                                :checked="sceneConfig.renderer.antialias"
                                @change="updateRenderer('antialias', $event.target.checked)"
                                class="checkbox"
                            />
                        </div>
                        <div class="setting-item-inline">
                            <label>阴影</label>
                            <input
                                type="checkbox"
                                :checked="sceneConfig.renderer.shadowEnabled"
                                @change="updateRenderer('shadowEnabled', $event.target.checked)"
                                class="checkbox"
                            />
                        </div>
                        <div class="setting-item">
                            <label>输出色彩空间</label>
                            <Select
                                :model-value="sceneConfig.renderer.outputColorSpace"
                                @update:model-value="updateRenderer('outputColorSpace', $event)"
                                :options="colorSpaceOptions"
                            />
                        </div>
                    </div>
                </template>

                <!-- 相机设置 -->
                <template #camera>
                    <div class="settings-group">
                        <div class="setting-item">
                            <label>投影类型</label>
                            <Select
                                :model-value="sceneConfig.camera.type"
                                @update:model-value="updateCamera('type', $event)"
                                :options="cameraTypeOptions"
                            />
                        </div>
                        <div v-if="sceneConfig.camera.type === 'perspective'" class="setting-item">
                            <label>视野角度 (FOV)</label>
                            <Slider
                                :model-value="sceneConfig.camera.fov"
                                @update:model-value="updateCamera('fov', $event)"
                                :min="10"
                                :max="120"
                                :step="1"
                            />
                        </div>
                        <div class="setting-item">
                            <label>相机位置</label>
                            <div class="vector3-inputs">
                                <Input
                                    type="number"
                                    :model-value="sceneConfig.camera.position[0]"
                                    @update:model-value="updateCameraPosition(0, $event)"
                                    placeholder="X"
                                    :step="0.1"
                                />
                                <Input
                                    type="number"
                                    :model-value="sceneConfig.camera.position[1]"
                                    @update:model-value="updateCameraPosition(1, $event)"
                                    placeholder="Y"
                                    :step="0.1"
                                />
                                <Input
                                    type="number"
                                    :model-value="sceneConfig.camera.position[2]"
                                    @update:model-value="updateCameraPosition(2, $event)"
                                    placeholder="Z"
                                    :step="0.1"
                                />
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>目标点</label>
                            <div class="vector3-inputs">
                                <Input
                                    type="number"
                                    :model-value="sceneConfig.camera.lookAt[0]"
                                    @update:model-value="updateCameraLookAt(0, $event)"
                                    placeholder="X"
                                    :step="0.1"
                                />
                                <Input
                                    type="number"
                                    :model-value="sceneConfig.camera.lookAt[1]"
                                    @update:model-value="updateCameraLookAt(1, $event)"
                                    placeholder="Y"
                                    :step="0.1"
                                />
                                <Input
                                    type="number"
                                    :model-value="sceneConfig.camera.lookAt[2]"
                                    @update:model-value="updateCameraLookAt(2, $event)"
                                    placeholder="Z"
                                    :step="0.1"
                                />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 光照设置 -->
                <template #lighting>
                    <div class="settings-group">
                        <!-- 环境光 -->
                        <div class="light-section">
                            <div class="section-header">
                                <span>环境光</span>
                                <input
                                    type="checkbox"
                                    :checked="sceneConfig.lighting.ambient.enabled"
                                    @change="updateLighting('ambient', { enabled: $event.target.checked })"
                                    class="checkbox"
                                />
                            </div>
                            <div v-if="sceneConfig.lighting.ambient.enabled" class="light-controls">
                                <div class="setting-item">
                                    <label>颜色</label>
                                    <ColorPicker
                                        :model-value="sceneConfig.lighting.ambient.color"
                                        @update:model-value="updateLighting('ambient', { color: $event })"
                                    />
                                </div>
                                <div class="setting-item">
                                    <label>强度</label>
                                    <Slider
                                        :model-value="sceneConfig.lighting.ambient.intensity"
                                        @update:model-value="updateLighting('ambient', { intensity: $event })"
                                        :min="0"
                                        :max="2"
                                        :step="0.1"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- 平行光 -->
                        <div class="light-section">
                            <div class="section-header">
                                <span>平行光</span>
                                <input
                                    type="checkbox"
                                    :checked="sceneConfig.lighting.directional.enabled"
                                    @change="updateLighting('directional', { enabled: $event.target.checked })"
                                    class="checkbox"
                                />
                            </div>
                            <div v-if="sceneConfig.lighting.directional.enabled" class="light-controls">
                                <div class="setting-item">
                                    <label>颜色</label>
                                    <ColorPicker
                                        :model-value="sceneConfig.lighting.directional.color"
                                        @update:model-value="updateLighting('directional', { color: $event })"
                                    />
                                </div>
                                <div class="setting-item">
                                    <label>强度</label>
                                    <Slider
                                        :model-value="sceneConfig.lighting.directional.intensity"
                                        @update:model-value="updateLighting('directional', { intensity: $event })"
                                        :min="0"
                                        :max="2"
                                        :step="0.1"
                                    />
                                </div>
                                <div class="setting-item-inline">
                                    <label>投射阴影</label>
                                    <input
                                        type="checkbox"
                                        :checked="sceneConfig.lighting.directional.castShadow"
                                        @change="updateLighting('directional', { castShadow: $event.target.checked })"
                                        class="checkbox"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 背景设置 -->
                <template #background>
                    <div class="settings-group">
                        <div class="setting-item">
                            <label>背景类型</label>
                            <Select
                                :model-value="sceneConfig.background.type"
                                @update:model-value="updateBackground('type', $event)"
                                :options="backgroundTypeOptions"
                            />
                        </div>
                        <div v-if="sceneConfig.background.type === 'color'" class="setting-item">
                            <label>背景颜色</label>
                            <ColorPicker
                                :model-value="sceneConfig.background.color"
                                @update:model-value="updateBackground('color', $event)"
                            />
                        </div>
                        <div v-if="sceneConfig.background.type === 'gradient'" class="setting-item">
                            <label>顶部颜色</label>
                            <ColorPicker
                                :model-value="sceneConfig.background.gradientTop"
                                @update:model-value="updateBackground('gradientTop', $event)"
                            />
                        </div>
                        <div v-if="sceneConfig.background.type === 'gradient'" class="setting-item">
                            <label>底部颜色</label>
                            <ColorPicker
                                :model-value="sceneConfig.background.gradientBottom"
                                @update:model-value="updateBackground('gradientBottom', $event)"
                            />
                        </div>
                        <div v-if="sceneConfig.background.type === 'hdr'" class="setting-item">
                            <label>HDR URL</label>
                            <Input
                                :model-value="sceneConfig.background.hdrUrl"
                                @update:model-value="updateBackground('hdrUrl', $event)"
                                placeholder="/hdr/environment.hdr"
                            />
                        </div>
                    </div>
                </template>

                <!-- 辅助显示 -->
                <template #helpers>
                    <div class="settings-group">
                        <div class="setting-item-inline">
                            <label>显示网格</label>
                            <input
                                type="checkbox"
                                :checked="sceneConfig.helpers.grid.enabled"
                                @change="updateHelpers('grid', { enabled: $event.target.checked })"
                                class="checkbox"
                            />
                        </div>
                        <div v-if="sceneConfig.helpers.grid.enabled" class="setting-item">
                            <label>网格大小</label>
                            <Slider
                                :model-value="sceneConfig.helpers.grid.size"
                                @update:model-value="updateHelpers('grid', { size: $event })"
                                :min="1"
                                :max="100"
                                :step="1"
                            />
                        </div>
                        <div class="setting-item-inline">
                            <label>显示坐标轴</label>
                            <input
                                type="checkbox"
                                :checked="sceneConfig.helpers.axes.enabled"
                                @change="updateHelpers('axes', { enabled: $event.target.checked })"
                                class="checkbox"
                            />
                        </div>
                    </div>
                </template>
            </Accordion>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSceneStore } from '@/stores/useSceneStore';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Slider from '@/components/ui/Slider.vue';
import ColorPicker from '@/components/ui/ColorPicker.vue';
import Accordion from '@/components/ui/Accordion.vue';
import * as THREE from 'three';

const sceneStore = useSceneStore();

const sceneConfig = computed(() => sceneStore.sceneConfig);

// Accordion 配置
const accordionItems = [
    { key: 'renderer', label: '渲染器', icon: '🎨' },
    { key: 'camera', label: '相机', icon: '📷' },
    { key: 'lighting', label: '光照', icon: '💡' },
    { key: 'background', label: '背景', icon: '🖼️' },
    { key: 'helpers', label: '辅助显示', icon: '📐' }
];

// 选项配置
const colorSpaceOptions = [
    { value: 'srgb', label: 'sRGB' },
    { value: 'linear', label: 'Linear' }
];

const cameraTypeOptions = [
    { value: 'perspective', label: '透视相机' },
    { value: 'orthographic', label: '正交相机' }
];

const backgroundTypeOptions = [
    { value: 'color', label: '纯色' },
    { value: 'hdr', label: 'HDR' }
];

// 更新渲染器
const updateRenderer = (key, value) => {
    sceneStore.updateRendererConfig({ [key]: value });
};

// 更新相机
const updateCamera = (key, value) => {
    sceneStore.updateCameraConfig({ [key]: value });
};

const updateCameraPosition = (index, value) => {
    const newPosition = [...sceneConfig.value.camera.position];
    newPosition[index] = parseFloat(value) || 0;
    sceneStore.updateCameraConfig({ position: newPosition });
};

const updateCameraLookAt = (index, value) => {
    const newLookAt = [...sceneConfig.value.camera.lookAt];
    newLookAt[index] = parseFloat(value) || 0;
    sceneStore.updateCameraConfig({ lookAt: newLookAt });
};

// 更新光照
const updateLighting = (lightType, updates) => {
    const newConfig = {
        [lightType]: {
            ...sceneConfig.value.lighting[lightType],
            ...updates
        }
    };
    sceneStore.updateLightingConfig(newConfig);
    // 应用光照更新
    if (sceneStore.sceneInstance) {
        sceneStore.sceneInstance.light.clear();
        const { lighting } = sceneConfig.value;
        if (lighting.ambient.enabled) {
            sceneStore.sceneInstance.light.addAmbient({
                color: lighting.ambient.color,
                intensity: lighting.ambient.intensity
            });
        }
        if (lighting.directional.enabled) {
            sceneStore.sceneInstance.light.addDirectional({
                color: lighting.directional.color,
                intensity: lighting.directional.intensity,
                position: lighting.directional.position || [10, 10, 5],
                castShadow: lighting.directional.castShadow
            });
        }
    }
};

// 更新背景
const updateBackground = (key, value) => {
    sceneStore.updateBackgroundConfig({ [key]: value });
    // 应用背景更新
    if (sceneStore.sceneInstance) {
        const scene = sceneStore.sceneInstance;
        const { background } = sceneConfig.value;


        switch (background.type) {
            case 'color':
                scene.scene.background = new THREE.Color(background.color);
                break;
            case 'gradient':
                // 渐变背景需要使用着色器或纹理实现
                scene.scene.background = new THREE.Color(background.gradientTop);
                break;
            case 'hdr':
                // HDR 背景将在后续实现
                break;
        }
    }
};

// 更新辅助显示
const updateHelpers = (helperType, updates) => {
    const newConfig = {
        [helperType]: {
            ...sceneConfig.value.helpers[helperType],
            ...updates
        }
    };
    sceneStore.updateHelpersConfig(newConfig);

    // 应用网格显示变化
    if (helperType === 'grid' && updates.enabled !== undefined && sceneStore.sceneInstance) {
        const scene = sceneStore.sceneInstance;
        const existingGrid = scene.getComponentByName('grid-helper');

        if (updates.enabled && !existingGrid) {
            // 添加网格
            scene.add('GridHelper', {
                name: 'grid-helper',
                size: sceneConfig.value.helpers.grid.size,
                divisions: sceneConfig.value.helpers.grid.divisions,
                color: sceneConfig.value.helpers.grid.color
            });
        } else if (!updates.enabled && existingGrid) {
            // 移除网格
            scene.remove('grid-helper');
        }
    }
};
</script>

<style scoped>
.scene-settings {
    @apply h-full overflow-y-auto;
}

.settings-content {
    @apply p-4;
}

.settings-group {
    @apply space-y-3;
}

.setting-item {
    @apply flex flex-col gap-1 text-sm;
}

.setting-item label {
    @apply font-medium text-gray-700;
}

.setting-item-inline {
    @apply flex items-center justify-between text-sm;
}

.setting-item-inline label {
    @apply font-medium text-gray-700;
}

.checkbox {
    @apply w-4 h-4 rounded border-gray-300;
}

.vector3-inputs {
    @apply grid grid-cols-3 gap-2;
}

.light-section {
    @apply border border-gray-200 rounded p-3 space-y-2;
}

.section-header {
    @apply flex items-center justify-between font-medium text-gray-700;
}

.light-controls {
    @apply space-y-2 mt-2;
}
</style>

