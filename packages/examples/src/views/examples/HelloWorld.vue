<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="01 - Hello World"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Control Panel -->
        <GuiPanel title="Scene Info" width="narrow">
            <GuiInfoItem label="FPS:" :value="fps" />
            <GuiInfoItem label="Cube Rotation:" :value="`${cubeRotation.toFixed(2)} rad`" />
            <GuiInfoItem label="Camera Position:" :value="cameraPosition" />
        </GuiPanel>
    </SplitLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';
import { GuiPanel, GuiInfoItem } from '../../components/Gui';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const fps = ref(60);
const cubeRotation = ref(0);
const cameraPos = ref({ x: 5, y: 5, z: 10 });

const cameraPosition = computed(() => {
    return `(${cameraPos.value.x.toFixed(1)}, ${cameraPos.value.y.toFixed(
        1
    )}, ${cameraPos.value.z.toFixed(1)})`;
});

let scene = null;
let cube = null;

// Source code
const sourceCode = `import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import * as THREE from 'three';

// Create scene
const scene = new Scene(container, {
  renderer: {
    antialias: true
  },
  camera: {
    fov: 45,
    position: [5, 5, 10],
    lookAt: [0, 0, 0]
  }
});

// Initialize scene
scene.init();

// Add ambient light
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.6
});

// Add directional light
scene.light.addDirectional({
  color: '#ffffff',
  intensity: 0.8,
  position: [5, 5, 5],
  castShadow: true
});

// Enable shadows
scene.renderer.enableShadow(true);

// Enable auto resize
scene.renderer.enableResize();

// Register component
scene.registerComponent('GridHelper', GridHelper);

// Add grid helper
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20
});

// Create cube
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
  color: '#00ff00',
  roughness: 0.5,
  metalness: 0.5
});
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.y = 1;
scene.scene.add(cube);

// Create ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: '#808080',
    roughness: 0.8,
    metalness: 0.2
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.scene.add(ground);

// Animation loop
const originalUpdate = scene.animate.bind(scene);
scene.animate = function() {
  originalUpdate();

  // Rotate cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
};

// Start rendering
scene.start();

console.log('🎉 Hello World Example');`;

onMounted(() => {
    initScene();
});

onUnmounted(() => {
    cleanup();
});

const initScene = () => {
    if (!sceneContainer.value) return;

    // Create scene
    scene = new Scene(sceneContainer.value, {
        renderer: {
            antialias: true
        },
        camera: {
            fov: 45,
            position: [5, 5, 10],
            lookAt: [0, 0, 0]
        }
    });

    // Initialize scene
    scene.init();

    // Add ambient light
    scene.light.addAmbient({
        color: '#ffffff',
        intensity: 0.6
    });

    // Add directional light
    scene.light.addDirectional({
        color: '#ffffff',
        intensity: 0.8,
        position: [5, 5, 5],
        castShadow: true
    });

    // Enable shadows
    scene.renderer.enableShadow(true);

    // Enable auto resize
    scene.renderer.enableResize();

    // Register component
    scene.registerComponent('GridHelper', GridHelper);

    // Add grid helper
    scene.add('GridHelper', {
        name: 'grid',
        size: 20,
        divisions: 20
    });

    // Create cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
        color: '#00ff00',
        roughness: 0.5,
        metalness: 0.5
    });
    cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.y = 1;
    scene.scene.add(cube);

    // Create ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({
            color: '#808080',
            roughness: 0.8,
            metalness: 0.2
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.scene.add(ground);

    // FPS calculation
    let lastTime = performance.now();
    let frames = 0;

    // Animation loop
    const originalUpdate = scene.animate.bind(scene);
    scene.animate = function () {
        originalUpdate();

        // Rotate cube
        if (cube) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            cubeRotation.value = cube.rotation.y;
        }

        // Update camera position
        if (scene.camera && scene.camera.camera) {
            const pos = scene.camera.camera.position;
            cameraPos.value = { x: pos.x, y: pos.y, z: pos.z };
        }

        // Calculate FPS
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
            fps.value = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
        }
    };

    // Start rendering
    scene.start();

    console.log('🎉 Hello World Example - Vue 3');
    console.log('Scene:', scene);
};

const cleanup = () => {
    console.log('Cleaning up Hello World example');
    if (scene) {
        scene.dispose();
        scene = null;
    }
    cube = null;
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
}
</style>

