import { BaseNode } from '../BaseNode.js';
import * as THREE from 'three';

/**
 * NetworkElementNode 网元节点
 *
 * @class NetworkElementNode
 * @extends BaseNode
 * @description 网络设备节点，支持多状态切换（正常、告警、离线等）
 *
 * @example
 * const node = new NetworkElementNode(scene, {
 *     name: '接入级网元',
 *     properties: {
 *         x: 100,
 *         y: 100,
 *         width: 64,
 *         height: 64
 *     },
 *     states: [
 *         {
 *             stateId: 0,
 *             stateName: '正常',
 *             icon: '/icons/接入级3型网元.png',
 *             style: { opacity: 1.0 }
 *         },
 *         {
 *             stateId: 1,
 *             stateName: '告警',
 *             icon: '/icons/接入级网元.png',
 *             style: { opacity: 1.0, filter: 'hue-rotate(45deg)' }
 *         }
 *     ]
 * });
 */
export class NetworkElementNode extends BaseNode {
    /**
     * 节点类型
     */
    static nodeType = 'network-element';

    /**
     * 默认属性
     */
    static defaultProperties = {
        ...BaseNode.defaultProperties,
        width: 64,
        height: 64,
        icon: '/icons/接入级3型网元.png',
        backgroundColor: 'transparent',
        borderWidth: 0
    };

    /**
     * 创建网元节点
     */
    onCreate() {
        super.onCreate();

        // 创建图标精灵
        this.createIconSprite();

        // 应用初始状态
        if (this.states && this.states.length > 0) {
            this.setState(this.currentStateId, true);
        }
    }

    /**
     * 创建图标精灵
     */
    createIconSprite() {
        const width = this.properties.width;
        const height = this.properties.height;

        // 创建平面几何体
        const geometry = new THREE.PlaneGeometry(width, height);

        // 加载纹理
        const iconPath = this.getCurrentIconPath();
        const texture = new THREE.TextureLoader().load(
            iconPath,
            // 加载成功回调
            () => {
                console.log(`[NetworkElementNode] Icon loaded: ${iconPath}`);
            },
            // 加载进度回调
            undefined,
            // 加载失败回调
            (error) => {
                console.error(`[NetworkElementNode] Failed to load icon: ${iconPath}`, error);
                // 使用默认颜色
                this.createFallbackMesh();
            }
        );

        // 创建材质
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: this.properties.opacity,
            side: THREE.DoubleSide
        });

        // 创建网格
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.userData.node = this;
        this.add(this.mesh);


        /*

        const total = 1000;
        this.mesh = new THREE.InstancedMesh(geometry, material, total);
        for(let i = 0; i< total; i++){
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = 0;
            this.mesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, y, z));
            this.mesh.setColorAt(i, new THREE.Color(0xFFFFFF));
            this.mesh.instanceColor.needsUpdate = true;
        }
        this.mesh.userData.node = this;
        this.add(this.mesh);

        */
    }

    /**
     * 创建备用网格（当图标加载失败时）
     */
    createFallbackMesh() {
        if (this.mesh) {
            this.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        const width = this.properties.width;
        const height = this.properties.height;

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            color: 0x409EFF,
            transparent: true,
            opacity: this.properties.opacity
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.userData.node = this;
        this.add(this.mesh);
    }

    /**
     * 获取当前图标路径
     *
     * @returns {string} 图标路径
     */
    getCurrentIconPath() {
        const currentState = this.getCurrentState();

        // 如果当前状态有图标，使用状态图标
        if (currentState && currentState.icon) {
            return currentState.icon;
        }

        // 否则使用默认图标
        return this.properties.icon || '/icons/接入级3型网元.png';
    }

    /**
     * 状态图标变化回调
     *
     * @param {string} iconPath - 图标路径
     */
    onStateIconChange(iconPath) {
        super.onStateIconChange(iconPath);

        // 更新纹理
        this.updateIconTexture(iconPath);
    }

    /**
     * 更新图标纹理
     *
     * @param {string} iconPath - 图标路径
     */
    updateIconTexture(iconPath) {
        if (!this.mesh || !this.mesh.material) {
            return;
        }

        // 加载新纹理
        const texture = new THREE.TextureLoader().load(
            iconPath,
            // 加载成功回调
            () => {
                console.log(`[NetworkElementNode] Icon updated: ${iconPath}`);

                // 释放旧纹理
                if (this.mesh.material.map) {
                    this.mesh.material.map.dispose();
                }

                // 应用新纹理
                this.mesh.material.map = texture;
                this.mesh.material.needsUpdate = true;
            },
            // 加载进度回调
            undefined,
            // 加载失败回调
            (error) => {
                console.error(`[NetworkElementNode] Failed to update icon: ${iconPath}`, error);
            }
        );
    }

    /**
     * 状态样式应用回调
     *
     * @param {Object} state - 状态配置对象
     */
    onStateStyleApplied(state) {
        super.onStateStyleApplied(state);

        // 应用透明度
        if (this.mesh && this.mesh.material && state.style.opacity !== undefined) {
            this.mesh.material.opacity = state.style.opacity;
            this.mesh.material.needsUpdate = true;
        }
    }

    /**
     * 属性变化回调
     *
     * @param {string} key - 属性名
     * @param {*} value - 新值
     * @param {*} oldValue - 旧值
     */
    onPropertyChange(key, value, oldValue) {
        super.onPropertyChange(key, value, oldValue);

        if (!this.mesh) return;

        switch (key) {
        case 'width':
        case 'height':
            // 更新几何体尺寸
            this.updateGeometry();
            break;

        case 'opacity':
            // 更新透明度
            if (this.mesh.material) {
                this.mesh.material.opacity = value;
                this.mesh.material.needsUpdate = true;
            }
            break;

        case 'icon':
            // 更新图标
            this.updateIconTexture(value);
            break;
        }
    }

    /**
     * 更新几何体
     */
    updateGeometry() {
        if (!this.mesh) return;

        const width = this.properties.width;
        const height = this.properties.height;

        // 释放旧几何体
        this.mesh.geometry.dispose();

        // 创建新几何体
        this.mesh.geometry = new THREE.PlaneGeometry(width, height);
    }

    /**
     * 序列化节点
     *
     * @returns {Object} 序列化数据
     */
    serialize() {
        const data = super.serialize();

        // 添加状态信息
        data.states = this.states;
        data.currentStateId = this.currentStateId;

        return data;
    }

    /**
     * 反序列化节点
     *
     * @param {Object} data - 序列化数据
     */
    deserialize(data) {
        super.deserialize(data);

        // 恢复状态信息
        if (data.states) {
            this.states = data.states;
        }

        if (data.currentStateId !== undefined) {
            this.setState(data.currentStateId, true);
        }
    }

    /**
     * 销毁节点
     */
    onDispose() {
        // 释放纹理
        if (this.mesh && this.mesh.material && this.mesh.material.map) {
            this.mesh.material.map.dispose();
        }

        super.onDispose();
    }
}

