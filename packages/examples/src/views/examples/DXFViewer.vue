<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="22 - DXF Viewer"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <!-- Loading State -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- Control Panel -->
            <template v-if="!isLoading">
                <GuiPanel title="DXF Viewer" width="wide">
                    <!-- DXF Loading -->
                    <GuiSection title="DXF File Loading">
                        <GuiTextInput
                            label="DXF File URL"
                            v-model="dxfConfig.url"
                            placeholder="Enter DXF file URL"
                            @keyup.enter="loadDXF"
                        />
                        <div class="button-group">
                            <GuiButton
                                label="Load DXF"
                                :disabled="!dxfConfig.url"
                                @click="loadDXF"
                            />
                            <GuiButton
                                label="Clear DXF"
                                variant="secondary"
                                :disabled="!currentDXF"
                                @click="clearDXF"
                            />
                        </div>
                    </GuiSection>

                    <!-- DXF Transform -->
                    <template v-if="currentDXF">
                        <GuiSection title="DXF Transform">
                            <!-- Position Control -->
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="X"
                                    v-model="dxfTransform.position.x"
                                    :step="1"
                                    @update:modelValue="updateDXFTransform"
                                />
                                <GuiNumberInput
                                    label="Y"
                                    v-model="dxfTransform.position.y"
                                    :step="1"
                                    @update:modelValue="updateDXFTransform"
                                />
                                <GuiNumberInput
                                    label="Z"
                                    v-model="dxfTransform.position.z"
                                    :step="1"
                                    @update:modelValue="updateDXFTransform"
                                />
                            </div>

                            <!-- Rotation Control -->
                            <GuiSlider
                                label="Rotation X Axis"
                                v-model="dxfTransform.rotation.x"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateDXFTransform"
                            />
                            <GuiSlider
                                label="Rotation Y Axis"
                                v-model="dxfTransform.rotation.y"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateDXFTransform"
                            />
                            <GuiSlider
                                label="Rotation Z Axis"
                                v-model="dxfTransform.rotation.z"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateDXFTransform"
                            />

                            <!-- Scale Control -->
                            <GuiSlider
                                label="Scale"
                                v-model="dxfTransform.scale"
                                :min="0.01"
                                :max="5"
                                :step="0.01"
                                :precision="2"
                                suffix="x"
                                @update:modelValue="updateDXFTransform"
                            />
                        </GuiSection>
                    </template>

                    <!-- Layer Management -->
                    <template v-if="currentDXF && availableLayers.length > 0">
                        <GuiSection title="Layer Management">
                            <GuiInfoItem label="Total Layers" :value="availableLayers.length" />
                            <div class="layer-list">
                                <div
                                    v-for="layer in availableLayers"
                                    :key="layer"
                                    class="layer-item"
                                >
                                    <GuiCheckbox
                                        :label="layer"
                                        :modelValue="visibleLayers.includes(layer)"
                                        @update:modelValue="(val) => toggleLayer(layer, val)"
                                    />
                                </div>
                            </div>
                            <div class="button-group">
                                <GuiButton
                                    label="Show All Layers"
                                    variant="secondary"
                                    @click="showAllLayers"
                                />
                                <GuiButton
                                    label="Hide All Layers"
                                    variant="secondary"
                                    @click="hideAllLayers"
                                />
                            </div>
                        </GuiSection>
                    </template>

                    <!-- DXF Information -->
                    <template v-if="currentDXF">
                        <GuiSection title="DXF Information">
                            <GuiInfoItem label="File Name" :value="dxfInfo.fileName" />
                            <GuiInfoItem label="Layer Count" :value="dxfInfo.layerCount" />
                            <GuiInfoItem label="Entity Count" :value="dxfInfo.entityCount" />
                        </GuiSection>
                    </template>

                    <!-- Reset Button -->
                    <GuiSection title="Operations">
                        <GuiButton
                            label="Reset Transform"
                            :disabled="!currentDXF"
                            @click="resetTransform"
                        />
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { DXFLoader, GridHelper, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiButton,
    GuiCheckbox,
    GuiTextInput,
    GuiNumberInput,
    GuiInfoItem,
    GuiLoading
} from '../../components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';

// Scene and component references
let scene = null;
let currentDXF = ref(null);
let gridHelper = null;

// Loading state
const isLoading = ref(true);
const loadingProgress = ref(0);
const loadingText = ref('Initializing scene...');

// Scene only mode
const isSceneOnly = ref(true);

// DXF configuration
const dxfConfig = reactive({
    url: '/dfx/demo.dxf'
});

// DXF transform
const dxfTransform = reactive({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1
});

// Layer management
const availableLayers = ref([]);
const visibleLayers = ref([]);

// DXF information
const dxfInfo = reactive({
    fileName: '',
    layerCount: 0,
    entityCount: 0
});

// Source code for display
const sourceCode = `import { Scene } from '@w3d/core';
import { DXFLoader } from '@w3d/components';

// Create scene
const scene = new Scene('#app')
    .camera({ position: [0, 200, 400] })
    .light('ambient', { color: '#fff', intensity: 0.8 })
    .light('directional', {
        color: '#fff',
        intensity: 1.0,
        position: [100, 100, 100]
    })
    .enableResize()
    .init();

// Register DXFLoader component
scene.registerComponent('DXFLoader', DXFLoader);

// Load DXF file
const dxfViewer = await scene.add('DXFLoader', {
    name: 'cad-drawing',
    url: '/dfx/demo.dxf',
    position: [0, 0, 0],
    scale: 0.1
});

// Listen to loading events
dxfViewer.on('loadProgress', (event) => {
    console.log('Loading:', event.progress * 100 + '%');
});

dxfViewer.on('loadComplete', (event) => {
    console.log('DXF loaded successfully');
    console.log('Available layers:', dxfViewer.getLayers());
});

// Layer management
const layers = dxfViewer.getLayers();
dxfViewer.setLayerVisible('Layer1', false); // Hide Layer1
dxfViewer.setVisibleLayers(['Layer2', 'Layer3']); // Show only Layer2 and Layer3
`;

const sceneContainer = ref(null);
// Initialize scene
const initScene = async () => {
    try {
        loadingText.value = 'Creating scene...';
        loadingProgress.value = 0.1;

        // Create scene
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [0, 200, 400],
                lookAt: [0, 0, 0]
            }
        });
        /* .camera({ position: [0, 200, 400], fov: 45 })
            .light('ambient', { color: '#ffffff', intensity: 0.8 })
            .light('directional', {
                color: '#ffffff',
                intensity: 1.0,
                position: [100, 100, 100],
                castShadow: true
            })
            .enableShadow()
            .enableResize()
            .init();
 */
        scene.init();
        loadingProgress.value = 0.3;

        // Register components
        scene.registerComponent('DXFLoader', DXFLoader);
        // scene.registerComponent('GridHelper', GridHelper);
        // scene.registerComponent('HDRLoader', HDRLoader);
        // await scene.add('HDRLoader', {
        //     name: 'environment',
        //     url: '/textures/blouberg_sunrise_2_1k.hdr',
        //     intensity: 1.0,
        //     asEnvironment: true,
        //     asBackground: true
        // });
        loadingProgress.value = 0.5;

        // Add grid helper
        // gridHelper = await scene.add('GridHelper', {
        //     name: 'grid',
        //     size: 1000,
        //     divisions: 50,
        //     colorCenterLine: '#888888',
        //     colorGrid: '#444444'
        // });

        loadingProgress.value = 0.7;

        // Load default DXF file
        await loadDXF();

        loadingProgress.value = 1.0;
        isLoading.value = false;
    } catch (error) {
        console.error('Failed to initialize scene:', error);
        loadingText.value = 'Failed to initialize scene';
    }
};

// Load DXF file
const loadDXF = async () => {
    if (!dxfConfig.url) {
        return;
    }

    try {
        // Clear existing DXF
        if (currentDXF.value) {
            scene.remove(currentDXF.value.name);
            currentDXF.value = null;
        }

        loadingText.value = 'Loading DXF file...';

        // Load DXF
        currentDXF.value = await scene.add('DXFLoader', {
            name: 'dxf-viewer',
            url: dxfConfig.url,
            position: [dxfTransform.position.x, dxfTransform.position.y, dxfTransform.position.z],
            rotation: [
                (dxfTransform.rotation.x * Math.PI) / 180,
                (dxfTransform.rotation.y * Math.PI) / 180,
                (dxfTransform.rotation.z * Math.PI) / 180
            ],
            scale: dxfTransform.scale
        });



        // Listen to events
        currentDXF.value.on('loadProgress', (event) => {
            loadingProgress.value = 0.7 + event.progress * 0.3;
        });

        currentDXF.value.on('loadComplete', (event) => {
            // console.log('DXF loaded successfully:', event.dxfData);
            // // Get available layers
            // availableLayers.value = currentDXF.value.getLayers();
            // visibleLayers.value = [...availableLayers.value];
            // // Update DXF info
            // dxfInfo.fileName = dxfConfig.url.split('/').pop();
            // dxfInfo.layerCount = availableLayers.value.length;
            // dxfInfo.entityCount = event.dxfData.entities ? event.dxfData.entities.length : 0;
        });

        currentDXF.value.on('error', (event) => {
            console.error('Failed to load DXF:', event.error);
            alert('Failed to load DXF file: ' + event.error.message);
        });
    } catch (error) {
        console.error('Failed to load DXF:', error);
        alert('Failed to load DXF file: ' + error.message);
    }
};

// Clear DXF
const clearDXF = () => {
    if (currentDXF.value) {
        scene.remove(currentDXF.value.name);
        currentDXF.value = null;
        availableLayers.value = [];
        visibleLayers.value = [];
        dxfInfo.fileName = '';
        dxfInfo.layerCount = 0;
        dxfInfo.entityCount = 0;
    }
};

// Update DXF transform
const updateDXFTransform = () => {
    if (!currentDXF.value || !currentDXF.value.dxfGroup) {
        return;
    }

    // Update position
    currentDXF.value.dxfGroup.position.set(
        dxfTransform.position.x,
        dxfTransform.position.y,
        dxfTransform.position.z
    );

    // Update rotation
    currentDXF.value.dxfGroup.rotation.set(
        (dxfTransform.rotation.x * Math.PI) / 180,
        (dxfTransform.rotation.y * Math.PI) / 180,
        (dxfTransform.rotation.z * Math.PI) / 180
    );

    // Update scale
    currentDXF.value.dxfGroup.scale.set(dxfTransform.scale, dxfTransform.scale, dxfTransform.scale);
};

// Toggle layer visibility
const toggleLayer = (layerName, visible) => {
    if (!currentDXF.value) {
        return;
    }

    currentDXF.value.setLayerVisible(layerName, visible);

    if (visible) {
        if (!visibleLayers.value.includes(layerName)) {
            visibleLayers.value.push(layerName);
        }
    } else {
        visibleLayers.value = visibleLayers.value.filter((l) => l !== layerName);
    }
};

// Show all layers
const showAllLayers = () => {
    if (!currentDXF.value) {
        return;
    }

    availableLayers.value.forEach((layer) => {
        currentDXF.value.setLayerVisible(layer, true);
    });
    visibleLayers.value = [...availableLayers.value];
};

// Hide all layers
const hideAllLayers = () => {
    if (!currentDXF.value) {
        return;
    }

    availableLayers.value.forEach((layer) => {
        currentDXF.value.setLayerVisible(layer, false);
    });
    visibleLayers.value = [];
};

// Reset transform
const resetTransform = () => {
    dxfTransform.position.x = 0;
    dxfTransform.position.y = 0;
    dxfTransform.position.z = 0;
    dxfTransform.rotation.x = 0;
    dxfTransform.rotation.y = 0;
    dxfTransform.rotation.z = 0;
    dxfTransform.scale = 0.1;
    updateDXFTransform();
};

// Lifecycle hooks
onMounted(() => {
    initScene();
});

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

.button-group {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.layer-list {
    max-height: 200px;
    overflow-y: auto;
    margin: 8px 0;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.layer-item {
    padding: 4px 0;
}
</style>

