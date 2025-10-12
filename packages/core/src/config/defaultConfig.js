/**
 * 默认配置
 *
 * @description 定义 SDK 的默认配置选项
 */
export const defaultConfig = {
    // 渲染器配置
    renderer: {
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        shadowMap: {
            enabled: false,
            type: 'PCFSoftShadowMap'
        }
    },

    // 相机配置
    camera: {
        fov: 45,
        near: 0.1,
        far: 10000,
        position: [0, 100, 200],
        lookAt: [0, 0, 0]
    },

    // 控制器配置
    controls: {
        enableDamping: true,
        dampingFactor: 0.05,
        enableZoom: true,
        enableRotate: true,
        enablePan: true,
        autoRotate: false,
        autoRotateSpeed: 2.0,
        minDistance: 1,
        maxDistance: 1000
    },

    // 灯光配置
    lights: {
        ambient: {
            color: '#ffffff',
            intensity: 0.5
        },
        directional: {
            color: '#ffffff',
            intensity: 1.0,
            position: [100, 100, 100],
            castShadow: false
        }
    },

    // 场景配置
    scene: {
        background: null,
        fog: null
    },

    // 性能配置
    performance: {
        maxFPS: 60,
        enableStats: false
    }
};

export default defaultConfig;
