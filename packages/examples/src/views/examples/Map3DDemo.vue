<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="09 - 3D Map"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Control Panel -->
        <GuiPanel title="Map Controls" width="wide">
            <!-- Map Selection -->
            <GuiSection title="Map Selection">
                <GuiSelect
                    label="Select Map"
                    v-model="selectedMap"
                    :options="[
                        { value: 'world', label: 'World Map' },
                        { value: 'china', label: 'China Map' },
                        { value: 'sichuan', label: 'Sichuan Province' }
                    ]"
                    @update:modelValue="changeMap"
                />

                <GuiSelect
                    label="Entry Animation"
                    v-model="entryType"
                    :options="[
                        { value: 0, label: 'None' },
                        { value: 1, label: 'Scale' },
                        { value: 2, label: 'Roll' },
                        { value: 3, label: 'Stretch' }
                    ]"
                    @update:modelValue="updateEntryType"
                />
            </GuiSection>

            <!-- Configuration Options -->
            <GuiSection title="Configuration Options">
                <GuiCheckbox
                    label="Enable Carousel"
                    v-model="carouselEnabled"
                    @update:modelValue="toggleCarousel"
                />

                <GuiSlider
                    label="Side Height"
                    v-model="sideHeight"
                    :min="0"
                    :max="20"
                    :step="1"
                    @update:modelValue="updateSideHeight"
                />

                <GuiColorPicker
                    label="Block Color"
                    v-model="blockColor"
                    @update:modelValue="updateBlockColor"
                />
            </GuiSection>

            <!-- Information Display -->
            <GuiSection title="Map Information">
                <GuiInfoItem label="Area Count" :value="areaCount" />
                <template v-if="currentArea">
                    <GuiInfoItem label="Current Area" :value="currentArea" />
                </template>
            </GuiSection>

            <!-- Operation Buttons -->
            <GuiSection title="Operations">
                <div class="button-group">
                    <GuiButton label="Reset Camera" @click="resetCamera" />
                    <GuiButton :label="mapVisible ? 'Hide Map' : 'Show Map'" @click="toggleMap" />
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
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

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

// Map data configuration
const mapConfigs = {
    world: {
        url: '/svg/map/world.json',
        name: 'World Map',
        camera: { x: 0, y: 100, z: 100 }
    },
    china: {
        url: '/svg/map/990001.json',
        name: 'China Map',
        camera: { x: 0, y: 100, z: 100 }
    },
    sichuan: {
        url: '/svg/map/sichuan.json',
        name: 'Sichuan Province',
        camera: { x: 0, y: 100, z: 100 }
    }
};

// Source code
const sourceCode = `import { Scene } from '@w3d/core';
import { SvgMap3D } from '@w3d/components';

// Create scene
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

// Add lighting
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.8
});

scene.light.addDirectional({
  color: '#ffffff',
  intensity: 1.0,
  position: [100, 200, 100]
});

// Register map component
scene.registerComponent('SvgMap3D', SvgMap3D);

// Add map
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

// Listen for events
map.on('dataLoaded', (data) => {
  console.log('Map loading complete', data);
});

map.on('carousel', (area) => {
  console.log('Carousel to:', area.name);
});

// Load map data
await map.setMapData('/svg/map/990001.json');

// Start rendering
scene.start();

console.log('🗺️ 3D Map Example - Vue 3');`;

onMounted(() => {
    initScene();
});

onUnmounted(() => {
    cleanup();
});

const initScene = async () => {
    if (!sceneContainer.value) return;

    // Create scene
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

    // Add lighting
    scene.light.addAmbient({
        color: '#ffffff',
        intensity: 0.8
    });

    scene.light.addDirectional({
        color: '#ffffff',
        intensity: 1.0,
        position: [100, 200, 100]
    });

    // Enable auto-resize
    scene.renderer.enableResize();

    // Register map component
    scene.registerComponent('SvgMap3D', SvgMap3D);

    // Load map
    await loadMap(selectedMap.value);

    // Start rendering
    scene.start();

    console.log('🗺️ 3D Map Example - Vue 3');
};

const loadMap = async (mapKey) => {
    const config = mapConfigs[mapKey];

    if (!config) {
        console.error('Map configuration does not exist:', mapKey);
        return;
    }

    // Remove old map
    if (mapComponent) {
        scene.remove(mapComponent);
        mapComponent = null;
    }

    try {
        // Add new map
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

        // Listen for events
        mapComponent.on('dataLoaded', (data) => {
            console.log('Map loading complete', data);
            if (data && data.series) {
                areaCount.value = data.series.length;
            }
        });

        mapComponent.on('carousel', (area) => {
            console.log('Carousel to:', area.name);
            currentArea.value = area.name;
        });

        // Listen for interaction events
        mapComponent.on('click', (data) => {
            console.log('✅ Area clicked:', data.area.name);
            currentArea.value = data.area.name;
        });

        mapComponent.on('mouseenter', (data) => {
            console.log('🖱️ Mouse enter:', data.area.name);
            currentArea.value = data.area.name;
            // Change cursor style
            if (sceneContainer.value) {
                sceneContainer.value.style.cursor = 'pointer';
            }
        });

        mapComponent.on('mouseleave', (data) => {
            console.log('👋 Mouse leave:', data.area.name);
            // Restore cursor style
            if (sceneContainer.value) {
                sceneContainer.value.style.cursor = 'default';
            }
        });

        // Load map data
        await mapComponent.setMapData(config.url);
    } catch (error) {
        console.error('Map loading failed:', error);
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
    // Need to reload map to apply new side height
    // Simplified here, should provide dynamic update method in practice
};

const updateBlockColor = () => {
    // Need to reload map to apply new color
    // Simplified here, should provide dynamic update method in practice
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

