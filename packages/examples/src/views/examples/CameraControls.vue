<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="02 - Camera Controls"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <GuiLoading
                :visible="isLoading"
                :text="loadingText"
                :showProgress="true"
                :progress="loadingProgress"
            />

            <GuiPanel title="Camera Controls">
                <GuiSection title="Camera Position">
                    <div class="position-controls">
                        <GuiNumberInput
                            label="X"
                            v-model="cameraPosition.x"
                            @change="updateCameraPosition"
                            :step="1"
                        />
                        <GuiNumberInput
                            label="Y"
                            v-model="cameraPosition.y"
                            @change="updateCameraPosition"
                            :step="1"
                        />
                        <GuiNumberInput
                            label="Z"
                            v-model="cameraPosition.z"
                            @change="updateCameraPosition"
                            :step="1"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="Camera Parameters">
                    <GuiSlider
                        label="Field of View (FOV)"
                        v-model="cameraParams.fov"
                        :min="10"
                        :max="120"
                        :step="1"
                        suffix="°"
                        @change="updateCameraParams"
                    />
                    <GuiSlider
                        label="Near Clipping Plane"
                        v-model="cameraParams.near"
                        :min="0.1"
                        :max="10"
                        :step="0.1"
                        :precision="1"
                        @change="updateCameraParams"
                    />
                    <GuiSlider
                        label="Far Clipping Plane"
                        v-model="cameraParams.far"
                        :min="100"
                        :max="10000"
                        :step="100"
                        :precision="0"
                        @change="updateCameraParams"
                    />
                </GuiSection>

                <GuiSection title="Controls Settings">
                    <GuiCheckbox
                        label="Enable Damping"
                        v-model="controlsSettings.enableDamping"
                        @change="updateControlsSettings"
                    />
                    <GuiSlider
                        label="Damping Factor"
                        v-model="controlsSettings.dampingFactor"
                        :min="0.01"
                        :max="0.2"
                        :step="0.01"
                        :precision="2"
                        @change="updateControlsSettings"
                        :disabled="!controlsSettings.enableDamping"
                    />
                    <GuiCheckbox
                        label="Auto Rotate"
                        v-model="controlsSettings.autoRotate"
                        @change="updateControlsSettings"
                    />
                    <GuiSlider
                        label="Rotation Speed"
                        v-model="controlsSettings.autoRotateSpeed"
                        :min="0.5"
                        :max="10"
                        :step="0.5"
                        :precision="1"
                        @change="updateControlsSettings"
                        :disabled="!controlsSettings.autoRotate"
                    />
                </GuiSection>

                <GuiSection title="Distance Limits">
                    <GuiSlider
                        label="Min Distance"
                        v-model="controlsSettings.minDistance"
                        :min="1"
                        :max="50"
                        :step="1"
                        @change="updateControlsSettings"
                    />
                    <GuiSlider
                        label="Max Distance"
                        v-model="controlsSettings.maxDistance"
                        :min="100"
                        :max="2000"
                        :step="50"
                        @change="updateControlsSettings"
                    />
                </GuiSection>

                <GuiSection title="Preset Positions">
                    <div class="preset-buttons">
                        <GuiButton label="Front" size="small" @click="setCameraPreset('front')" />
                        <GuiButton label="Back" size="small" @click="setCameraPreset('back')" />
                        <GuiButton label="Left" size="small" @click="setCameraPreset('left')" />
                        <GuiButton label="Right" size="small" @click="setCameraPreset('right')" />
                        <GuiButton label="Top" size="small" @click="setCameraPreset('top')" />
                        <GuiButton label="Bottom" size="small" @click="setCameraPreset('bottom')" />
                    </div>
                    <GuiButton label="Reset" variant="secondary" block @click="resetCamera" />
                </GuiSection>
            </GuiPanel>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiCheckbox,
    GuiButton,
    GuiLoading,
    GuiNumberInput
} from '@/components/Gui';
import * as THREE from 'three';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('');
const loadingProgress = ref(0);

// Camera position state
const cameraPosition = reactive({
    x: 5,
    y: 5,
    z: 5
});

// Camera parameters state
const cameraParams = reactive({
    fov: 45,
    near: 0.1,
    far: 1000
});

// Controls settings state
const controlsSettings = reactive({
    enableDamping: true,
    dampingFactor: 0.05,
    autoRotate: false,
    autoRotateSpeed: 2.0,
    minDistance: 5,
    maxDistance: 500
});

let scene = null;
let gridHelper = null;
let cube = null;

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import * as THREE from 'three';

// Create scene
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [5, 5, 5],
    lookAt: [0, 0, 0],
    near: 0.1,
    far: 1000
  }
});

// Initialize scene
scene.init();

// Add basic lighting
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

// Enable shadows and auto resize
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// Register component
scene.registerComponent('GridHelper', GridHelper);

// Add grid helper
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20,
  color: '#888888'
});

// ===== Camera Control Configuration =====

// 1. Camera position control
scene.camera.setPosition(5, 5, 5);
scene.camera.lookAt(0, 0, 0);

// 2. Camera parameter adjustment
scene.camera.instance.fov = 45;
scene.camera.instance.near = 0.1;
scene.camera.instance.far = 1000;
scene.camera.instance.updateProjectionMatrix();

// 3. Orbit controls configuration
const controls = scene.controls.instance;

// Enable damping (smooth movement)
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Auto rotate
controls.autoRotate = false;
controls.autoRotateSpeed = 2.0;

// Distance limits
controls.minDistance = 5;
controls.maxDistance = 500;

// Enable/disable controls
controls.enableZoom = true;    // Zoom
controls.enableRotate = true;  // Rotate
controls.enablePan = true;     // Pan

// ===== Preset Camera Positions =====

// Front view
function setFrontView() {
  scene.camera.setPosition(0, 0, 20);
  scene.camera.lookAt(0, 0, 0);
}

// Top view
function setTopView() {
  scene.camera.setPosition(0, 20, 0);
  scene.camera.lookAt(0, 0, 0);
}

// Side view
function setSideView() {
  scene.camera.setPosition(20, 0, 0);
  scene.camera.lookAt(0, 0, 0);
}

// Reset camera
function resetCamera() {
  controls.reset();
}

// ===== Dynamic Adjustment Examples =====

// Dynamically modify camera position
// scene.camera.setPosition(x, y, z);

// Dynamically modify controls settings
// controls.enableDamping = true;
// controls.dampingFactor = 0.1;
// controls.autoRotate = true;

// Dynamically modify camera parameters
// scene.camera.instance.fov = 60;
// scene.camera.instance.updateProjectionMatrix();

// Start rendering
scene.start();`;
onMounted(() => {
    initScene();
});

onUnmounted(() => {
    cleanup();
});

// Initialize scene
const initScene = async () => {
    if (!sceneContainer.value) return;

    try {
        isLoading.value = true;
        loadingText.value = 'Initializing scene...';
        loadingProgress.value = 10;

        // Create scene
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: cameraParams.fov,
                position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
                lookAt: [0, 0, 0],
                near: cameraParams.near,
                far: cameraParams.far
            }
        });

        loadingProgress.value = 30;
        loadingText.value = 'Initializing renderer...';

        // Initialize scene
        scene.init();

        loadingProgress.value = 50;
        loadingText.value = 'Setting up lights...';

        // Add basic lighting
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

        loadingProgress.value = 70;
        loadingText.value = 'Configuring controls...';

        // Configure controls
        applyControlsSettings();

        // Enable shadows and auto resize
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 80;
        loadingText.value = 'Adding scene objects...';

        // Register component
        scene.registerComponent('GridHelper', GridHelper);

        // Add grid helper
        gridHelper = await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20,
            color: '#888888'
        });

        // Add a cube as reference object
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ color: '#00ff88' });
        cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 1, 0);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.scene.add(cube);

        loadingProgress.value = 100;
        loadingText.value = 'Complete';

        // Start rendering
        scene.start();

        // Ensure camera position is set correctly
        updateCameraPosition();

        // Delay hiding loading state
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('Scene initialization failed:', error);
        loadingText.value = 'Initialization failed';
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
};

// Apply controls settings
const applyControlsSettings = () => {
    if (!scene || !scene.controls) return;

    const controls = scene.controls.instance;
    controls.enableDamping = controlsSettings.enableDamping;
    controls.dampingFactor = controlsSettings.dampingFactor;
    controls.autoRotate = controlsSettings.autoRotate;
    controls.autoRotateSpeed = controlsSettings.autoRotateSpeed;
    controls.minDistance = controlsSettings.minDistance;
    controls.maxDistance = controlsSettings.maxDistance;
};

// Update camera position
const updateCameraPosition = () => {
    if (!scene || !scene.camera) return;
    scene.camera.setPosition(cameraPosition.x, cameraPosition.y, cameraPosition.z);
};

// Update camera parameters
const updateCameraParams = () => {
    if (!scene || !scene.camera) return;

    const camera = scene.camera.instance;
    camera.fov = cameraParams.fov;
    camera.near = cameraParams.near;
    camera.far = cameraParams.far;
    camera.updateProjectionMatrix();
};

// Update controls settings
const updateControlsSettings = () => {
    applyControlsSettings();
};

// Set preset camera position
const setCameraPreset = (preset) => {
    if (!scene || !scene.camera) return;

    const presets = {
        front: { position: [0, 0, 20], lookAt: [0, 0, 0] },
        back: { position: [0, 0, -20], lookAt: [0, 0, 0] },
        left: { position: [-20, 0, 0], lookAt: [0, 0, 0] },
        right: { position: [20, 0, 0], lookAt: [0, 0, 0] },
        top: { position: [0, 20, 0], lookAt: [0, 0, 0] },
        bottom: { position: [0, -20, 0], lookAt: [0, 0, 0] }
    };

    const config = presets[preset];
    if (config) {
        const [x, y, z] = config.position;
        const [lx, ly, lz] = config.lookAt;

        scene.camera.setPosition(x, y, z);
        scene.camera.lookAt(lx, ly, lz);

        // Update reactive data
        cameraPosition.x = x;
        cameraPosition.y = y;
        cameraPosition.z = z;
    }
};

// Reset camera
const resetCamera = () => {
    if (!scene || !scene.controls) return;
    scene.controls.instance.reset();

    // Reset reactive data to default position
    cameraPosition.x = 5;
    cameraPosition.y = 5;
    cameraPosition.z = 5;

    // Update camera position
    updateCameraPosition();
};

// Cleanup resources
const cleanup = () => {
    console.log('Cleaning up Camera Controls example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    gridHelper = null;
    cube = null;
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.position-controls {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}

.preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
}
</style>

