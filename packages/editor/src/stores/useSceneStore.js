import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

export const useSceneStore = defineStore('scene', () => {
    // 场景实例
    const sceneInstance = ref(null);

    // 场景配置
    const sceneConfig = reactive({
        // 渲染器配置
        renderer: {
            antialias: true,
            outputColorSpace: 'srgb',
            shadowEnabled: true
        },
        // 相机配置
        camera: {
            type: 'perspective', // 'perspective' | 'orthographic'
            fov: 45,
            position: [10, 8, 15],
            lookAt: [0, 0, 0]
        },
        // 光照配置
        lighting: {
            ambient: {
                enabled: true,
                color: '#ffffff',
                intensity: 0.6
            },
            directional: {
                enabled: true,
                color: '#ffffff',
                intensity: 0.8,
                position: [10, 10, 5],
                castShadow: true
            }
        },
        // 背景配置
        background: {
            type: 'color', // 'color' | 'gradient' | 'image' | 'hdr'
            color: '#f0f0f0',
            gradientTop: '#87ceeb',
            gradientBottom: '#ffffff',
            imageUrl: '',
            hdrUrl: '/textures/blouberg_sunrise_2_1k.hdr'
        },
        // 辅助显示
        helpers: {
            grid: {
                enabled: true,
                size: 20,
                divisions: 20,
                color: '#888888'
            },
            axes: {
                enabled: false,
                size: 5
            }
        }
    });

    // 场景状态
    const sceneState = reactive({
        initialized: false,
        loading: false,
        error: null
    });

    // 设置场景实例
    const setSceneInstance = (instance) => {
        sceneInstance.value = instance;
        sceneState.initialized = !!instance;
    };

    // 更新渲染器配置
    const updateRendererConfig = (config) => {
        Object.assign(sceneConfig.renderer, config);
        if (sceneInstance.value) {
            // 应用配置到场景
            if (config.shadowEnabled !== undefined) {
                sceneInstance.value.renderer.enableShadow(config.shadowEnabled);
            }
        }
    };

    // 更新相机配置
    const updateCameraConfig = (config) => {
        Object.assign(sceneConfig.camera, config);
        if (sceneInstance.value && sceneInstance.value.camera) {
            // 应用相机配置
            if (config.position) {
                sceneInstance.value.camera.instance.position.set(...config.position);
            }
            if (config.fov && sceneConfig.camera.type === 'perspective') {
                sceneInstance.value.camera.instance.fov = config.fov;
                sceneInstance.value.camera.instance.updateProjectionMatrix();
            }
        }
    };

    // 更新光照配置
    const updateLightingConfig = (config) => {
        Object.assign(sceneConfig.lighting, config);
        // 光照更新需要重新创建光源，这部分在 useScene 中处理
    };

    // 更新背景配置
    const updateBackgroundConfig = (config) => {
        Object.assign(sceneConfig.background, config);
        // 背景更新在 useScene 中处理
    };

    // 更新辅助显示配置
    const updateHelpersConfig = (config) => {
        Object.assign(sceneConfig.helpers, config);
        // 辅助显示更新在 useScene 中处理
    };

    // 设置加载状态
    const setLoading = (loading) => {
        sceneState.loading = loading;
    };

    // 设置错误
    const setError = (error) => {
        sceneState.error = error;
    };

    // 重置场景
    const resetScene = () => {
        if (sceneInstance.value) {
            sceneInstance.value.dispose();
            sceneInstance.value = null;
        }
        sceneState.initialized = false;
        sceneState.loading = false;
        sceneState.error = null;
    };

    return {
        // 状态
        sceneInstance,
        sceneConfig,
        sceneState,

        // 方法
        setSceneInstance,
        updateRendererConfig,
        updateCameraConfig,
        updateLightingConfig,
        updateBackgroundConfig,
        updateHelpersConfig,
        setLoading,
        setError,
        resetScene
    };
});

