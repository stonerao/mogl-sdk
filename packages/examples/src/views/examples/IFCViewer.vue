<template>
    <div class="scene-container" ref="sceneContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { IFCLoader } from '@w3d/components';

const sceneContainer = ref(null);
let scene = null;
let ifcComponent = null;

onMounted(async () => {
    if (!sceneContainer.value) return;

    // 创建场景
    scene = new Scene(sceneContainer.value, {
        renderer: { antialias: true, outputColorSpace: 'srgb' },
        camera: { fov: 45, position: [90, 25, -70], lookAt: [0, 0, 0] }
    });
    scene.init();

    // 基本灯光，与参考示例保持一致
    scene.light.addDirectional({ color: '#ffeeff', intensity: 2.5, position: [1, 1, 1] });
    scene.light.addDirectional({ color: '#ffffff', intensity: 2.5, position: [-1, 0.5, -1] });
    scene.light.addAmbient({ color: '#ffffee', intensity: 0.75 });

    // 注册 IFCLoader 组件并加载 IFC 模型
    scene.registerComponent('IFCLoader', IFCLoader);
    ifcComponent = await scene.add('IFCLoader', {
        name: 'ifc-model',
        url: '/ifc/rac_advanced_sample_project.ifc',
        wasmPath: 'https://cdn.jsdelivr.net/npm/web-ifc@0.0.72/',
        useFastBools: true,
        excludeSpaces: true,
        centerModel: true,
        enableInteraction: true
    });

    // 可选：监听完成事件，打印模型信息
    ifcComponent.on('loadComplete', () => {
        const info = ifcComponent.getModelInfo();
        console.log('IFC model info:', info);
    });

    scene.start();
});

onUnmounted(() => {
    if (scene) scene.dispose();
    scene = null;
    ifcComponent = null;
});
</script>

<style scoped>
.scene-container { width: 100%; height: 100%; position: relative; background: #1a1a1a; }
</style>
