<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="18 - Path Tracer"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <!-- Loading State -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- Rendering Progress -->
            <template v-if="isRendering">
                <GuiLoading :progress="renderProgress" text="GPU Path Tracing Rendering..." />
            </template>

            <!-- Control Panel -->
            <template v-if="!isLoading">
                <GuiPanel title="Path Tracing Controls" width="wide">
                    <!-- Render Control -->
                    <GuiSection title="Render Control">
                        <div class="button-group">
                            <GuiButton
                                label="Start Rendering"
                                :disabled="!pathTracer || isRendering"
                                @click="startRender"
                            />
                            <GuiButton
                                label="Pause"
                                variant="secondary"
                                :disabled="!pathTracer || !isRendering"
                                @click="pauseRender"
                            />
                            <GuiButton
                                label="Resume"
                                variant="secondary"
                                :disabled="!pathTracer || isRendering"
                                @click="resumeRender"
                            />
                            <GuiButton
                                label="Reset"
                                variant="secondary"
                                :disabled="!pathTracer"
                                @click="resetRender"
                            />
                            <GuiButton
                                label="Download Image"
                                variant="secondary"
                                :disabled="!pathTracer"
                                @click="downloadRender"
                            />
                        </div>
                    </GuiSection>

                    <!-- Render Settings -->
                    <GuiSection title="Render Settings">
                        <GuiSlider
                            label="Target Samples"
                            v-model="renderSettings.samples"
                            :min="10"
                            :max="500"
                            :step="10"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiSlider
                            label="Resolution Scale"
                            v-model="renderSettings.resolutionScale"
                            :min="0.1"
                            :max="1.0"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiSlider
                            label="Tiles"
                            v-model="renderSettings.tiles"
                            :min="1"
                            :max="6"
                            :step="1"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiCheckbox
                            label="Enable Tone Mapping"
                            v-model="renderSettings.toneMapping"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiCheckbox
                            label="Transparent Background"
                            v-model="renderSettings.transparentBackground"
                            @update:modelValue="updateRenderSettings"
                        />
                    </GuiSection>

                    <!-- Floor Settings -->
                    <GuiSection title="Floor Settings">
                        <GuiCheckbox
                            label="Enable Floor"
                            v-model="floorSettings.enabled"
                            @update:modelValue="recreatePathTracer"
                        />
                        <template v-if="floorSettings.enabled">
                            <GuiSlider
                                label="Roughness"
                                v-model="floorSettings.roughness"
                                :min="0"
                                :max="1"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateFloorMaterial"
                            />
                            <GuiSlider
                                label="Metalness"
                                v-model="floorSettings.metalness"
                                :min="0"
                                :max="1"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateFloorMaterial"
                            />
                        </template>
                    </GuiSection>

                    <!-- Material Adjustment -->
                    <GuiSection title="Material Adjustment">
                        <GuiCheckbox
                            label="Auto Adjust Materials"
                            v-model="materialSettings.adjustMaterials"
                            @update:modelValue="recreatePathTracer"
                        />
                        <template v-if="materialSettings.adjustMaterials">
                            <GuiSlider
                                label="Roughness Scale"
                                v-model="materialSettings.roughnessScale"
                                :min="0.1"
                                :max="1.0"
                                :step="0.05"
                                :precision="2"
                                @update:modelValue="recreatePathTracer"
                            />
                            <GuiCheckbox
                                label="Enable Transmission Effect"
                                v-model="materialSettings.enableTransmission"
                                @update:modelValue="recreatePathTracer"
                            />
                        </template>
                    </GuiSection>

                    <!-- Rendering Information -->
                    <GuiSection title="Rendering Information">
                        <GuiInfoItem label="Status" :value="renderStatus" />
                        <GuiInfoItem label="Current Samples" :value="currentSamples" />
                        <GuiInfoItem label="Progress" :value="`${renderProgress}%`" />
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { PathTracer, ModelLoader, GridHelper, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiCheckbox,
    GuiButton,
    GuiInfoItem,
    GuiLoading
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('Loading...');
const loadingProgress = ref(0);
const isRendering = ref(false);
const renderProgress = ref(0);
const currentSamples = ref(0);
const targetSamples = ref(100);
const renderStatus = ref('Not started');

let scene = null;
let pathTracer = null;
let model = null;

// Render settings
const renderSettings = reactive({
    samples: 100,
    resolutionScale: 1.0,
    tiles: 3,
    toneMapping: true,
    transparentBackground: false
});

// Floor settings
const floorSettings = reactive({
    enabled: true,
    roughness: 0.15,
    metalness: 0.9
});

// Material settings
const materialSettings = reactive({
    adjustMaterials: true,
    roughnessScale: 0.25,
    enableTransmission: true
});

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { PathTracer, ModelLoader } from '@w3d/components';

// Create scene (enable camera controller)
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
    enabled: true,        // Enable camera control
    enableDamping: true   // Enable damping effect
  }
});

scene.init();

// Register components
scene.registerComponent('PathTracer', PathTracer);
scene.registerComponent('ModelLoader', ModelLoader);

// Load model
const model = await scene.add('ModelLoader', {
  name: 'christmas',
  url: '/models/christmas.glb',
  scale: 1.0,
  position: [0, 0, 0]
});

// Wait for model loading to complete
model.on('loadComplete', async () => {
  // Remove model from scene (PathTracer will re-add it)
  scene.scene.remove(model.model);

  // Create path tracer (use model.model to get actual THREE.Group)
  const pathTracer = await scene.add('PathTracer', {
    name: 'pathtracer',
    model: model.model,  // ⚠️ Important: use model.model instead of model
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

  // Listen for camera changes (auto-supported)
  pathTracer.on('cameraChanged', () => {
    console.log('Camera position changed, re-rendering...');
  });

  // Listen for render progress
  pathTracer.on('progress', (data) => {
    const percent = (data.progress * 100).toFixed(1);
    console.log(\`Render progress: \${percent}%\`);
    console.log(\`Samples: \${data.samples}/\${data.targetSamples}\`);
  });

  // Listen for render completion
  pathTracer.on('complete', (data) => {
    console.log('Rendering complete!', data.samples);
    // Can download render result
    pathTracer.download('pathtraced-render.png');
  });

  // Control methods
  // pathTracer.start();   // Start rendering
  // pathTracer.pause();   // Pause rendering
  // pathTracer.resume();  // Resume rendering
  // pathTracer.reset();   // Reset rendering
});

// Users can freely rotate, scale, and pan the camera
// PathTracer will automatically update and re-render

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

        // Add lighting
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.6
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [5, 5, 5]
        });

        // Register components
        scene.registerComponent('PathTracer', PathTracer);
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('GridHelper', GridHelper);
        scene.registerComponent('HDRLoader', HDRLoader);
        // Load HDR environment map
        await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });
        // Add grid
        await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20
        });
        // Load model
        isLoading.value = true;
        loadingText.value = 'Loading model...';

        model = await scene.add('ModelLoader', {
            name: 'christmas',
            url: '/models/christmas.glb',
            scale: 1.0,
            position: [0, 0, 0]
        });
        console.log(model);
        // Listen for load progress
        model.on('loadProgress', (data) => {
            loadingProgress.value = Math.round(data.progress * 100);
        });

        model.on('loadComplete', async () => {
            isLoading.value = false;
            loadingText.value = 'Initializing path tracer...';

            // Remove model from scene (PathTracer will re-add it)
            scene.scene.remove(model.model);

            // Create path tracer
            await createPathTracer();
        });
    } catch (error) {
        console.error('Initialization failed:', error);
        isLoading.value = false;
    }
});

// Create path tracer
const createPathTracer = async () => {
    try {
        // Remove old path tracer
        if (pathTracer) {
            scene.remove('pathtracer');
            pathTracer = null;
        }

        isLoading.value = true;
        loadingText.value = 'Initializing path tracer...';

        pathTracer = await scene.add('PathTracer', {
            name: 'pathtracer',
            model: model.componentScene, // Use model.model to get actual THREE.Group
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

        // Listen for render events
        pathTracer.on('start', () => {
            isRendering.value = true;
            renderStatus.value = 'Rendering';
        });

        pathTracer.on('pause', () => {
            isRendering.value = false;
            renderStatus.value = 'Paused';
        });

        pathTracer.on('resume', () => {
            isRendering.value = true;
            renderStatus.value = 'Rendering';
        });

        pathTracer.on('stop', () => {
            isRendering.value = false;
            renderStatus.value = 'Stopped';
        });

        pathTracer.on('progress', (data) => {
            currentSamples.value = data.samples;
            targetSamples.value = data.targetSamples;
            renderProgress.value = Math.round(data.progress * 100);
        });

        pathTracer.on('complete', () => {
            isRendering.value = false;
            renderStatus.value = 'Rendering complete';
        });

        isLoading.value = false;
        isRendering.value = true;
        renderStatus.value = 'Rendering';
    } catch (error) {
        console.error('Failed to create path tracer:', error);
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

// Update render settings
const updateRenderSettings = () => {
    if (!pathTracer) return;

    targetSamples.value = renderSettings.samples;
    pathTracer.setResolutionScale(renderSettings.resolutionScale);
    pathTracer.setTiles(renderSettings.tiles);

    // Updating tone mapping and background requires recreation
    if (
        pathTracer.config.toneMapping !== renderSettings.toneMapping ||
        pathTracer.config.transparentBackground !== renderSettings.transparentBackground
    ) {
        recreatePathTracer();
    }
};

// Update floor material
const updateFloorMaterial = () => {
    if (!pathTracer || !pathTracer.floor) return;

    pathTracer.floor.material.roughness = floorSettings.roughness;
    pathTracer.floor.material.metalness = floorSettings.metalness;
    pathTracer.updateMaterials();
};

// Recreate path tracer
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

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

/* Button group */
.button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
