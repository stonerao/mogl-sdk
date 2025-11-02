import { Scene } from '@w3d/core';
import { useSceneStore } from '@/stores/useSceneStore';
import { getAllComponents } from '@/utils/componentRegistry';
import * as THREE from 'three';

/**
 * 场景管理组合式函数
 */
export function useScene() {
    const sceneStore = useSceneStore();

    /**
     * 初始化场景
     * @param {HTMLElement} container - 场景容器
     */
    const initScene = async (container) => {
        if (!container) {
            throw new Error('Scene container is required');
        }

        try {
            sceneStore.setLoading(true);
            sceneStore.setError(null);

            const { renderer, camera } = sceneStore.sceneConfig;

            // 创建场景实例
            const scene = new Scene(container, {
                renderer: {
                    antialias: renderer.antialias,
                    outputColorSpace: renderer.outputColorSpace
                },
                camera: {
                    fov: camera.fov,
                    position: camera.position,
                    lookAt: camera.lookAt
                }
            });

            // 初始化场景
            scene.init();

            // 启用阴影
            if (renderer.shadowEnabled) {
                scene.renderer.enableShadow(true);
            }

            // 启用自动调整大小
            scene.renderer.enableResize();

            // 设置场景背景
            applyBackground(scene);

            // 添加光照
            await setupLighting(scene);

            // 注册所有组件
            registerAllComponents(scene);

            // 添加辅助显示
            await setupHelpers(scene);

            // 保存场景实例
            sceneStore.setSceneInstance(scene);

            // 启动渲染
            scene.start();

            sceneStore.setLoading(false);

            return scene;
        } catch (error) {
            console.error('Failed to initialize scene:', error);
            sceneStore.setError(error.message);
            sceneStore.setLoading(false);
            throw error;
        }
    };

    /**
     * 应用场景背景
     * @param {Scene} scene - 场景实例
     */
    const applyBackground = (scene) => {
        const { background } = sceneStore.sceneConfig;
        console.log(THREE);
        switch (background.type) {
        case 'color':
            scene.scene.background = new THREE.Color(background.color);
            break;
        case 'image':
            if (background.imageUrl) {
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(background.imageUrl, (texture) => {
                    scene.scene.background = texture;
                });
            }
            break;
        case 'hdr':
            // HDR 环境贴图加载将在后续实现
            break;
        default:
            scene.scene.background = new THREE.Color('#f0f0f0');
        }
    };

    /**
     * 设置光照
     * @param {Scene} scene - 场景实例
     */
    const setupLighting = async (scene) => {
        const { lighting } = sceneStore.sceneConfig;

        // 添加环境光
        if (lighting.ambient.enabled) {
            scene.light.addAmbient({
                color: lighting.ambient.color,
                intensity: lighting.ambient.intensity
            });
        }

        // 添加平行光
        if (lighting.directional.enabled) {
            scene.light.addDirectional({
                color: lighting.directional.color,
                intensity: lighting.directional.intensity,
                position: lighting.directional.position,
                castShadow: lighting.directional.castShadow
            });
        }
    };

    /**
     * 注册所有组件
     * @param {Scene} scene - 场景实例
     */
    const registerAllComponents = (scene) => {
        const components = getAllComponents();
        components.forEach((comp) => {
            scene.registerComponent(comp.name, comp.class);
        });
    };

    /**
     * 设置辅助显示
     * @param {Scene} scene - 场景实例
     */
    const setupHelpers = async (scene) => {
        const { helpers } = sceneStore.sceneConfig;

        // 添加网格辅助
        if (helpers.grid.enabled) {
            await scene.add('GridHelper', {
                name: 'grid-helper',
                size: helpers.grid.size,
                divisions: helpers.grid.divisions,
                color: helpers.grid.color
            });
        }

        // 添加坐标轴辅助
        if (helpers.axes.enabled) {
            const axesHelper = new THREE.AxesHelper(helpers.axes.size);
            scene.scene.add(axesHelper);
        }
    };

    /**
     * 更新场景背景
     * @param {Object} config - 背景配置
     */
    const updateBackground = (config) => {
        sceneStore.updateBackgroundConfig(config);
        if (sceneStore.sceneInstance) {
            applyBackground(sceneStore.sceneInstance);
        }
    };

    /**
     * 更新光照
     * @param {Object} config - 光照配置
     */
    const updateLighting = async (config) => {
        sceneStore.updateLightingConfig(config);
        if (sceneStore.sceneInstance) {
            // 清除现有光源
            sceneStore.sceneInstance.light.clear();
            // 重新设置光照
            await setupLighting(sceneStore.sceneInstance);
        }
    };

    /**
     * 切换网格辅助显示
     * @param {boolean} enabled - 是否启用
     */
    const toggleGridHelper = async (enabled) => {
        sceneStore.updateHelpersConfig({
            grid: { ...sceneStore.sceneConfig.helpers.grid, enabled }
        });

        if (sceneStore.sceneInstance) {
            const scene = sceneStore.sceneInstance;
            // 移除现有网格
            const existingGrid = scene.getComponentByName('grid-helper');
            if (existingGrid) {
                scene.remove('grid-helper');
            }

            // 如果启用，添加新网格
            if (enabled) {
                const { grid } = sceneStore.sceneConfig.helpers;
                await scene.add('GridHelper', {
                    name: 'grid-helper',
                    size: grid.size,
                    divisions: grid.divisions,
                    color: grid.color
                });
            }
        }
    };

    /**
     * 销毁场景
     */
    const disposeScene = () => {
        if (sceneStore.sceneInstance) {
            sceneStore.sceneInstance.dispose();
            sceneStore.resetScene();
        }
    };

    return {
        // 场景状态
        sceneInstance: sceneStore.sceneInstance,
        sceneConfig: sceneStore.sceneConfig,
        sceneState: sceneStore.sceneState,

        // 方法
        initScene,
        updateBackground,
        updateLighting,
        toggleGridHelper,
        disposeScene
    };
}

