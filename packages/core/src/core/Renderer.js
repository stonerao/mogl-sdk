import * as THREE from 'three';

/**
 * Renderer 渲染器类
 *
 * @class Renderer
 * @description WebGL 渲染器的封装和管理
 */
export class Renderer {
    /**
     * 创建渲染器实例
     *
     * @param {Scene} scene - 场景实例
     * @param {Object} options - 配置选项
     */
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            ...options
        };

        // 创建 WebGL 渲染器
        this.instance = new THREE.WebGLRenderer(this.options);

        // 设置渲染器大小
        this.resize();

        // 设置像素比
        this.instance.setPixelRatio(window.devicePixelRatio);

        // 设置色彩空间
        this.instance.outputColorSpace = THREE.SRGBColorSpace;

        // 启用阴影
        this.instance.shadowMap.enabled = false;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;

        // 添加到容器
        this.scene.container.appendChild(this.instance.domElement);

        // 监听窗口大小变化
        this.handleResize = this.resize.bind(this);
    }

    /**
     * 启用阴影
     *
     * @param {boolean} enabled - 是否启用
     * @param {number} type - 阴影类型
     */
    enableShadow(enabled = true, type = THREE.PCFSoftShadowMap) {
        this.instance.shadowMap.enabled = enabled;
        this.instance.shadowMap.type = type;
    }

    /**
     * 启用自动调整大小
     */
    enableResize() {
        window.addEventListener('resize', this.handleResize);
    }

    /**
     * 禁用自动调整大小
     */
    disableResize() {
        window.removeEventListener('resize', this.handleResize);
    }

    /**
     * 调整渲染器大小
     */
    resize() {
        const width = this.scene.container.clientWidth;
        const height = this.scene.container.clientHeight;

        this.instance.setSize(width, height);

        // 更新相机
        if (this.scene.camera) {
            this.scene.camera.resize(width, height);
        }
    }

    /**
     * 渲染场景
     *
     * @param {THREE.Scene} scene - Three.js 场景
     * @param {THREE.Camera} camera - Three.js 相机
     */
    render(scene, camera) {
        this.instance.render(scene, camera);
    }

    /**
     * 设置背景色
     *
     * @param {string|number} color - 颜色值
     */
    setBackground(color) {
        this.instance.setClearColor(color);
    }

    /**
     * 销毁渲染器
     */
    dispose() {
        // 移除事件监听
        this.disableResize();

        // 销毁渲染器
        this.instance.dispose();

        // 移除 DOM 元素
        if (this.instance.domElement.parentNode) {
            this.instance.domElement.parentNode.removeChild(this.instance.domElement);
        }
    }
}
