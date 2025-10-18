<template>
    <div>
        <div ref="sceneContainer" class="scene-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';

const sceneContainer = ref(null);

let scene = null;
let modelComponent = null;
let hdrComponent = null;

onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('Scene initialization failed:', error);
    }
});

onUnmounted(() => {
    cleanup();
});

// Initialize scene
const initScene = async () => {
    try {
        // Create scene
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [-225, 55, 105],
                near: 2,
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
        hdrComponent = await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });

        // Load model - use SDK built-in baked lighting feature
        modelComponent = await scene.add('ModelLoader', {
            name: 'model',
            url: '/models/DigitalFactory.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: true,
            receiveShadow: true,

            // Use SDK built-in baked lighting functionality
            bakedLighting: {
                enabled: true,
                textureMapping: {
                    Land02: '/bake/DigitalFactory/Land02.jpg',
                    设备01: '/bake/DigitalFactory/设备01.jpg',
                    设备02: '/bake/DigitalFactory/设备02.jpg',
                    build01: '/bake/DigitalFactory/build01.jpg',
                    build02: '/bake/DigitalFactory/build02.jpg',
                    Land01: '/bake/DigitalFactory/Land01.jpg'
                },
                mode: 'bake',
                intensity: 1,
                autoApply: true,
                channel: 0,
                flipY: false,
                IndependentMaterial: true
            }
        });

        // Start rendering
        scene.start();
    } catch (error) {
        console.error('Scene loading failed:', error);
    }
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

<style scoped>
.scene-container {
    width: 100vw;
    height: 100vh;
    background: #1a1a1a;
    position: relative;
    overflow: hidden;
}
</style>
