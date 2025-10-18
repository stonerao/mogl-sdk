<template>
    <SplitLayout
        :code="sourceCode || '// Loading...'"
        language="javascript"
        :title="'08 - Model Baking Lighting'"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Loading State -->
        <template v-if="isLoading">
            <GuiLoading :progress="loadingProgress" :text="loadingText || 'Loading...'" />
        </template>

        <!-- Control Panel -->
        <template v-if="!isLoading">
            <GuiPanel title="Model Baking Lighting Controls" width="wide">
                <!-- Model Information -->
                <GuiSection title="Model Information">
                    <GuiInfoItem label="Mesh Count" :value="meshCount || 0" />
                </GuiSection>

                <!-- Baked Lighting Control -->
                <GuiSection title="Baked Lighting Settings">
                    <GuiCheckbox
                        label="Enable Baked Lighting"
                        v-model="bakedLightingSettings.enabled"
                        @update:modelValue="toggleBakedLighting"
                    />

                    <template v-if="bakedLightingSettings.enabled">
                        <GuiSlider
                            label="Bake Intensity"
                            v-model="bakedLightingSettings.intensity"
                            :min="0"
                            :max="2"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateBakedIntensity"
                        />

                        <GuiSelect
                            label="Apply Mode"
                            v-model="bakedLightingSettings.mode"
                            :options="[
                                { value: 'map', label: 'Replace Texture (map)' },
                                { value: 'lightMap', label: 'Light Map (lightMap)' }
                            ]"
                            @update:modelValue="updateBakedMode"
                        />

                        <GuiSelect
                            label="UV Channel"
                            v-model="bakedLightingSettings.channel"
                            :options="[
                                { value: '0', label: 'UV1 (channel 0)' },
                                { value: '1', label: 'UV2 (channel 1) - Recommended' }
                            ]"
                            @update:modelValue="updateBakedChannel"
                        />

                        <GuiInfoItem
                            label="Applied Objects"
                            :value="bakedLightingSettings.appliedCount || 0"
                        />
                        <GuiInfoItem
                            label="Load Status"
                            :value="bakedLightingSettings.statusText || 'Not Started'"
                        />
                    </template>
                </GuiSection>

                <!-- Debug Tools -->
                <GuiSection title="Debug Tools">
                    <div class="button-group">
                        <GuiButton label="Print Model Info" @click="printModelInfo" />
                        <GuiButton label="Test Baked Lighting" @click="testBakedLighting" />
                        <GuiButton label="Test Material Cloning" @click="testMaterialCloning" />
                    </div>
                </GuiSection>

                <!-- Camera Control -->
                <GuiSection title="Camera Control">
                    <div class="button-group">
                        <GuiButton label="Reset View" @click="resetCamera" />
                        <GuiButton label="Focus Model" @click="focusModel" />
                    </div>
                </GuiSection>
            </GuiPanel>
        </template>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiLoading,
    GuiInfoItem,
    GuiCheckbox,
    GuiSlider,
    GuiSelect,
    GuiButton
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('Initializing...');
const loadingProgress = ref(0);

// Model-related state
const meshCount = ref(0);

// Baked lighting state
const bakedLightingSettings = reactive({
    enabled: false,
    intensity: 1.0,
    mode: 'map', // 'map' or 'lightMap'
    channel: 1, // UV channel: 0=UV1, 1=UV2
    appliedCount: 0,
    status: 'idle', // 'idle', 'loading', 'success', 'error'
    statusText: 'Not Started'
});

let scene = null;
let modelComponent = null;
let hdrComponent = null;

// Baked texture mapping configuration
const bakeTextureMapping = {
    Castle_Exterior: '/bake/room/Castle_Exterior.jpg',
    Towers_Doors_and_Windows: '/bake/room/Towers_Doors_and_Windows.jpg',
    Ground_and_Fountain: '/bake/room/Ground_and_Fountain.jpg',
    Castle_Interior: '/bake/room/Castle_Interior.jpg'
};

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';

// Create scene
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [10, 8, 15],
    lookAt: [0, 0, 0]
  }
});

// Initialize scene
scene.init();

// Enable shadow and auto-resize
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// Register components
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('HDRLoader', HDRLoader);

// Load HDR environment map
const hdr = await scene.add('HDRLoader', {
  name: 'environment',
  url: '/textures/blouberg_sunrise_2_1k.hdr',
  intensity: 1.0
});

// Baked texture mapping configuration
const bakeTextureMapping = {
  Castle_Exterior: '/bake/room/Castle_Exterior.jpg',
  Towers_Doors_and_Windows: '/bake/room/Towers_Doors_and_Windows.jpg',
  Ground_and_Fountain: '/bake/room/Ground_and_Fountain.jpg',
  Castle_Interior: '/bake/room/Castle_Interior.jpg'
};

// ===== ModelLoader now supports multiple formats =====
// Supported formats: GLTF (.gltf), GLB (.glb), FBX (.fbx)
// Auto-detect format, no need to manually specify loader

// Load GLTF/GLB model + baked lighting
const model = await scene.add('ModelLoader', {
  name: 'castle',
  url: '/models/room.glb',  // Supports .glb, .gltf, .fbx
  scale: 1,
  position: [0, 0, 0],
  castShadow: true,
  receiveShadow: true,

  // Use SDK built-in baked lighting feature
  bakedLighting: {
    enabled: true,                      // Enable baked lighting
    textureMapping: bakeTextureMapping, // Texture mapping configuration
    mode: 'lightMap',                   // Apply mode: 'map' or 'lightMap'
    intensity: 1.0,                     // Lighting intensity (lightMap mode only)
    autoApply: true,                    // Auto-apply after model loading
    channel: 1                          // UV channel index: 0=UV1, 1=UV2 (recommended)
  }
});

// Can also load FBX model (auto-detect format)
const fbxModel = await scene.add('ModelLoader', {
  name: 'character',
  url: '/models/character.fbx',  // FBX format auto-detected
  scale: 0.01,  // FBX models usually need to be scaled down
  position: [5, 0, 0],
  castShadow: true,

  // FBX models also support baked lighting
  bakedLighting: {
    enabled: true,
    textureMapping: {
      'body': '/textures/character_baked.jpg'
    },
    mode: 'map'
  }
});

// Listen for baked lighting events
model.on('bakedLightingApplied', (event) => {
  console.log('Baked lighting applied:', event.appliedCount, 'objects');
  console.log('Apply mode:', event.mode);
  console.log('Lighting intensity:', event.intensity);
});

model.on('bakedLightingRemoved', (event) => {
  console.log('Baked lighting removed:', event.removedCount, 'objects');
});

// Listen for model loading completion
model.on('loadComplete', (data) => {
  console.log('Model loading complete');
  console.log('Model type:', data.type);  // 'gltf' or 'fbx'
  console.log('Animation count:', data.modelData.animations.length);
});

// Dynamically control baked lighting
// Enable baked lighting
await model.applyBakedLighting(bakeTextureMapping, {
  mode: 'lightMap',
  intensity: 1.0,
  channel: 1
});

// Update baked intensity (lightMap mode only)
model.updateBakedIntensity(1.5);

// Remove baked lighting (restore original material)
model.removeBakedLighting();

// Start rendering
scene.start();

// ===== Important Features =====

// 1. Multi-format support (new feature):
//    - Auto-detect GLTF/GLB/FBX format
//    - Unified API, no need to worry about format differences
//    - All formats support baked lighting

// 2. SDK auto-handles material cloning:
//    - Automatically clone materials internally, avoid sharing issues
//    - Save original materials, can restore anytime

// 3. SDK auto-handles texture settings:
//    - Auto-set flipY = false (GLB/GLTF standard)
//    - Auto-set correct color space (SRGBColorSpace)
//    - Auto-set UV channel (supports UV1 and UV2)

// 4. Performance optimization:
//    - Texture caching mechanism, avoid repeated loading
//    - Async loading, non-blocking main thread
//    - Comprehensive error handling

// 5. Flexible configuration:
//    - Support two modes: map (replace texture) and lightMap (light map)
//    - Configurable UV channel (baked textures usually use UV2)
//    - Dynamically adjust intensity and mode`;

onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('Scene initialization failed:', error);
        isLoading.value = false;
        loadingText.value = 'Initialization failed: ' + error.message;
    }
});

onUnmounted(() => {
    cleanup();
});

// Initialize scene
const initScene = async () => {
    isLoading.value = true;
    loadingText.value = 'Initializing scene...';
    loadingProgress.value = 10;

    try {
        // Create scene
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [1, 2, 1],
                lookAt: [0, 0, 0]
            }
        });

        // Initialize scene
        scene.init();
        // Enable shadow and auto-resize
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        // Register components
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('HDRLoader', HDRLoader);

        loadingText.value = 'Loading environment map...';
        loadingProgress.value = 30;

        // Load HDR environment map
        hdrComponent = await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });

        loadingText.value = 'Loading model...';
        loadingProgress.value = 50;

        // Load model - use SDK built-in baked lighting feature
        modelComponent = await scene.add('ModelLoader', {
            name: 'model',
            url: '/models/room.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: true,
            receiveShadow: true,

            // Use SDK built-in baked lighting functionality
            bakedLighting: {
                enabled: true, // Initially disabled, controlled by user
                textureMapping: bakeTextureMapping, // Texture mapping configuration
                mode: 'lightMap', // Application mode
                intensity: 0.6, // Lighting intensity
                autoApply: true, // Do not auto-apply, controlled by user
                channel: 0
            }
        });

        // Listen for model loading events
        modelComponent.on('loaded', () => {
            // Count Meshes and print debug information
            let count = 0;

            modelComponent.model.traverse((child) => {
                if (child.isMesh) {
                    count++;
                    console.log(`Mesh ${count}: Name="${child.name}", UUID=${child.uuid}`);

                    // Check if there is a corresponding baked texture
                    const texturePath = bakeTextureMapping[child.name];
                    if (texturePath) {
                        console.log(`  ✅ Found Baked Texture: ${texturePath}`);
                    } else {
                        console.log(`  ❌ Baked Texture Not Found (Name: "${child.name}")`);
                    }
                }
            });

            meshCount.value = count;
        });

        // Listen for baked lighting events
        modelComponent.on('bakedLightingApplied', (event) => {
            bakedLightingSettings.appliedCount = event.appliedCount;
            bakedLightingSettings.status = 'success';
            bakedLightingSettings.statusText = 'Applied Successfully';
        });

        modelComponent.on('bakedLightingRemoved', () => {
            bakedLightingSettings.appliedCount = 0;
            bakedLightingSettings.status = 'idle';
            bakedLightingSettings.statusText = 'Not Started';
        });

        loadingText.value = 'Starting Rendering...';
        loadingProgress.value = 90;

        // Start rendering
        scene.start();

        loadingProgress.value = 100;
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('Scene initialization failed:', error);
        isLoading.value = false;
        loadingText.value = 'Loading failed: ' + error.message;
    }
};

// Baked lighting control methods
const toggleBakedLighting = async () => {
    if (!modelComponent) return;

    if (bakedLightingSettings.enabled) {
        bakedLightingSettings.status = 'loading';
        bakedLightingSettings.statusText = 'Applying...';

        await modelComponent.applyBakedLighting(bakeTextureMapping, {
            mode: bakedLightingSettings.mode,
            intensity: bakedLightingSettings.intensity,
            channel: parseInt(bakedLightingSettings.channel)
        });
    } else {
        modelComponent.removeBakedLighting();
    }
};

const updateBakedIntensity = () => {
    if (!modelComponent || !bakedLightingSettings.enabled) return;
    modelComponent.updateBakedIntensity(bakedLightingSettings.intensity);
};

const updateBakedMode = async () => {
    if (!modelComponent || !bakedLightingSettings.enabled) return;

    bakedLightingSettings.status = 'loading';
    bakedLightingSettings.statusText = 'Updating...';

    await modelComponent.applyBakedLighting(bakeTextureMapping, {
        mode: bakedLightingSettings.mode,
        intensity: bakedLightingSettings.intensity,
        channel: parseInt(bakedLightingSettings.channel)
    });
};

const updateBakedChannel = async () => {
    if (!modelComponent || !bakedLightingSettings.enabled) return;

    bakedLightingSettings.status = 'loading';
    bakedLightingSettings.statusText = 'Updating UV channel...';

    await modelComponent.applyBakedLighting(bakeTextureMapping, {
        mode: bakedLightingSettings.mode,
        intensity: bakedLightingSettings.intensity,
        channel: parseInt(bakedLightingSettings.channel)
    });
};

// Debug methods
const printModelInfo = () => {
    if (!modelComponent) {
        return;
    }

    let meshCount = 0;
    const meshNames = [];

    // Recursive function: print hierarchy structure
    const printHierarchy = (object, level = 0) => {
        if (object.isMesh) {
            meshCount++;
            meshNames.push(object.name);
        }

        // Recursively process child objects
        object.children.forEach((child) => {
            printHierarchy(child, level + 1);
        });
    };

    printHierarchy(modelComponent.model);
};

const testBakedLighting = async () => {
    if (!modelComponent) {
        return;
    }

    // Force enable baked lighting
    bakedLightingSettings.enabled = true;
    bakedLightingSettings.status = 'loading';
    bakedLightingSettings.statusText = 'Testing...';

    await modelComponent.applyBakedLighting(bakeTextureMapping, {
        mode: bakedLightingSettings.mode,
        intensity: bakedLightingSettings.intensity,
        channel: parseInt(bakedLightingSettings.channel)
    });
};

const testMaterialCloning = () => {
    if (!modelComponent) {
        return;
    }

    const meshes = [];
    const materialMap = new Map();

    // Collect all Meshes and their materials
    modelComponent.model.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);

            // Check if material is shared by multiple Meshes
            const materialId = child.material.uuid;
            if (!materialMap.has(materialId)) {
                materialMap.set(materialId, []);
            }
            materialMap.get(materialId).push(child.name || '(unnamed)');
        }
    });

    // Display material sharing situation
    materialMap.forEach((meshNames, materialId) => {
        if (meshNames.length > 1) {
            console.log(
                `⚠️  Material ${materialId.substring(0, 8)}... shared by ${
                    meshNames.length
                } Meshes:`
            );
            meshNames.forEach((name) => console.log(`    - ${name}`));
        } else {
            console.log(`✅ Material ${materialId.substring(0, 8)}... exclusive: ${meshNames[0]}`);
        }
    });

    // Test material independence after applying baked lighting
    if (meshes.length >= 2) {
        const testMesh1 = meshes[0];
        const testMesh2 = meshes[1];

        const originalMaterial1UUID = testMesh1.material.uuid;
        const originalMaterial2UUID = testMesh2.material.uuid;

        // Simulate applying baked lighting (only to first Mesh)
        console.log('\n🧪 Simulating applying baked lighting to Mesh 1...');

        // Save original material
        const originalMaterial1 = testMesh1.material;

        // Clone material (simulating applyTextureToMesh behavior)
        testMesh1.material = testMesh1.material.clone();
        testMesh1.material.needsUpdate = true;

        console.log(`Mesh 1 New Material UUID: ${testMesh1.material.uuid.substring(0, 8)}...`);
        console.log(
            `Mesh 2 Material UUID: ${testMesh2.material.uuid.substring(
                0,
                8
            )}... (should remain unchanged)`
        );

        // Verify material independence
        if (testMesh1.material.uuid !== originalMaterial1UUID) {
            console.log('✅ Mesh 1 material successfully cloned');
        } else {
            console.log('❌ Mesh 1 material cloning failed');
        }

        if (testMesh2.material.uuid === originalMaterial2UUID) {
            console.log('✅ Mesh 2 material remains unchanged');
        } else {
            console.log('❌ Mesh 2 material unexpectedly changed');
        }

        if (testMesh1.material.uuid !== testMesh2.material.uuid) {
            console.log('✅ Two Meshes now have different material instances');
        } else {
            console.log('❌ Two Meshes still share the same material instance');
        }

        // Restore original material
        console.log('\n🔄 Restoring original material for Mesh 1...');
        testMesh1.material = originalMaterial1;

        if (testMesh1.material.uuid === originalMaterial1UUID) {
            console.log('✅ Mesh 1 material restored');
        } else {
            console.log('❌ Mesh 1 material restoration failed');
        }
    }

    console.log('\n=== Material Cloning Test Complete ===');
};

// Camera control methods
const resetCamera = () => {
    if (!scene) return;
    scene.camera.setPosition(10, 8, 15);
    scene.camera.lookAt(0, 0, 0);
};

const focusModel = () => {
    if (!scene || !modelComponent) return;
    scene.camera.setPosition(5, 5, 8);
    scene.camera.lookAt(0, 0, 0);
};

// Clean up resources
const cleanup = () => {
    if (scene) {
        scene.dispose();
        scene = null;
    }
    modelComponent = null;
    hdrComponent = null;
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
.scene-container {
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    position: relative;
    overflow: hidden;
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
