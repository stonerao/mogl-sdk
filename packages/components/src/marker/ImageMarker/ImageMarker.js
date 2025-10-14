import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * ImageMarker 图片点位组件
 *
 * @class ImageMarker
 * @extends Component
 * @description 在三维空间中展示图片点位，支持多状态图片切换和鼠标交互
 */
export class ImageMarker extends Component {
    static defaultConfig = {
        markers: [], // 点位数据数组
        globalConfig: {
            // 全局默认配置
            type: 'sprite', // 'sprite' | 'plane'
            size: 5,
            opacity: 1.0,
            color: '#ffffff',
            sizeAttenuation: true // Sprite 大小是否随距离衰减
        }
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 图片点位对象映射表 (id -> markerObject)
        this.imageMarkers = new Map();

        // 图片点位数据映射表 (id -> markerData)
        this.markerDataMap = new Map();

        // 纹理缓存 (url -> texture)
        this.textureCache = new Map();

        // 纹理加载器
        this.textureLoader = new THREE.TextureLoader();

        // 鼠标交互相关
        this.raycaster = new THREE.Raycaster();
        // 设置 Sprite 检测的阈值（像素）
        this.raycaster.params.Sprite = { threshold: 10 };
        this.mouse = new THREE.Vector2();
        this.hoveredMarker = null;
    }

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 合并全局配置
        this.globalConfig = {
            ...this.constructor.defaultConfig.globalConfig,
            ...this.config.globalConfig
        };

        // 创建所有图片点位
        if (this.config.markers && this.config.markers.length > 0) {
            for (const markerData of this.config.markers) {
                await this.addMarker(markerData);
            }
        }

        // 设置鼠标交互事件监听
        this.setupMouseEvents();
    }

    // ==================== 纹理加载相关方法 ====================

    /**
     * 加载纹理（带缓存）
     * @param {string} url - 图片 URL
     * @returns {Promise<THREE.Texture>}
     */
    async loadTexture(url) {
        // 检查缓存
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url);
        }

        // 加载纹理
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    // 缓存纹理
                    this.textureCache.set(url, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load texture: ${url}`, error);
                    reject(error);
                }
            );
        });
    }

    // ==================== 点位创建和管理方法 ====================

    /**
     * 创建图片点位
     * @param {Object} markerData - 点位数据
     * @returns {Promise<THREE.Object3D>}
     */
    async createMarker(markerData) {
        const {
            id,
            position,
            type = 'sprite',
            state,
            images,
            size = 5,
            scale = { x: 1, y: 1 },
            offset = { x: 0, y: 0, z: 0 },
            color = '#ffffff',
            opacity = 1.0,
            sizeAttenuation = true,
            userData = {}
        } = markerData;

        // 验证必需参数
        if (!id || !position || !images) {
            console.warn('ImageMarker: id, position, and images are required');
            return null;
        }

        // 确定当前状态
        const currentState = state || Object.keys(images)[0];
        const imageUrl = images[currentState];

        if (!imageUrl) {
            console.warn(`ImageMarker: No image found for state "${currentState}"`);
            return null;
        }

        // 加载纹理
        let texture;
        try {
            texture = await this.loadTexture(imageUrl);
        } catch (error) {
            console.error(`ImageMarker: Failed to load image for marker "${id}"`, error);
            return null;
        }

        let markerObject;

        if (type === 'sprite') {
            // 创建 Sprite
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: new THREE.Color(color),
                opacity: opacity,
                transparent: true,
                sizeAttenuation: sizeAttenuation
            });

            markerObject = new THREE.Sprite(material);
            markerObject.scale.set(size * scale.x, size * scale.y, 1);
        } else if (type === 'plane') {
            // 创建 Plane
            const geometry = new THREE.PlaneGeometry(size * scale.x, size * scale.y);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                color: new THREE.Color(color),
                opacity: opacity,
                transparent: true,
                side: THREE.DoubleSide
            });

            markerObject = new THREE.Mesh(geometry, material);
        } else {
            console.warn(`ImageMarker: Unknown type "${type}", using sprite`);
            // 默认使用 sprite
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: new THREE.Color(color),
                opacity: opacity,
                transparent: true,
                sizeAttenuation: sizeAttenuation
            });

            markerObject = new THREE.Sprite(material);
            markerObject.scale.set(size * scale.x, size * scale.y, 1);
        }

        // 设置位置
        markerObject.position.set(
            position.x + offset.x,
            position.y + offset.y,
            position.z + offset.z
        );

        // 存储用户数据
        markerObject.userData = {
            ...userData,
            markerId: id,
            markerType: type,
            isImageMarker: true
        };

        return markerObject;
    }

    /**
     * 添加图片点位
     * @param {Object} markerData - 点位数据
     */
    async addMarker(markerData) {
        const { id } = markerData;

        if (!id) {
            console.warn('ImageMarker: id is required');
            return;
        }

        // 检查是否已存在
        if (this.imageMarkers.has(id)) {
            console.warn(`ImageMarker: Marker with id "${id}" already exists`);
            return;
        }

        // 创建点位对象
        const markerObject = await this.createMarker(markerData);

        if (!markerObject) {
            return;
        }

        // 添加到场景
        this.add(markerObject);

        // 保存到映射表
        this.imageMarkers.set(id, markerObject);

        // 保存点位数据
        const currentState = markerData.state || Object.keys(markerData.images)[0];
        this.markerDataMap.set(id, { ...markerData, state: currentState });

        // 触发事件
        this.emit('markerAdded', { markerId: id, markerData });
    }

    /**
     * 更新点位状态（切换图片）
     * @param {string} id - 点位 ID
     * @param {string} newState - 新状态
     */
    async updateState(id, newState) {
        const markerObject = this.imageMarkers.get(id);
        const markerData = this.markerDataMap.get(id);

        if (!markerObject || !markerData) {
            console.warn(`ImageMarker: Marker "${id}" not found`);
            return;
        }

        const { images } = markerData;
        const imageUrl = images[newState];

        if (!imageUrl) {
            console.warn(`ImageMarker: No image found for state "${newState}"`);
            return;
        }

        // 加载新纹理
        let texture;
        try {
            texture = await this.loadTexture(imageUrl);
        } catch (error) {
            console.error(`ImageMarker: Failed to load image for state "${newState}"`, error);
            return;
        }

        // 更新材质纹理
        markerObject.material.map = texture;
        markerObject.material.needsUpdate = true;

        // 保存旧状态
        const oldState = markerData.state;

        // 更新数据
        markerData.state = newState;
        this.markerDataMap.set(id, markerData);

        // 触发事件
        this.emit('markerStateChanged', { markerId: id, oldState, newState });
    }

    /**
     * 更新点位配置
     * @param {string} id - 点位 ID
     * @param {Object} updates - 更新的配置
     */
    updateMarker(id, updates) {
        const markerObject = this.imageMarkers.get(id);
        const markerData = this.markerDataMap.get(id);

        if (!markerObject || !markerData) {
            console.warn(`ImageMarker: Marker "${id}" not found`);
            return;
        }

        // 更新位置
        if (updates.position) {
            const offset = markerData.offset || { x: 0, y: 0, z: 0 };
            markerObject.position.set(
                updates.position.x + offset.x,
                updates.position.y + offset.y,
                updates.position.z + offset.z
            );
        }

        // 更新大小
        if (updates.size !== undefined) {
            const scale = markerData.scale || { x: 1, y: 1 };
            if (markerObject.isSprite) {
                markerObject.scale.set(updates.size * scale.x, updates.size * scale.y, 1);
            } else {
                markerObject.scale.set(updates.size * scale.x, updates.size * scale.y, 1);
            }
        }

        // 更新颜色
        if (updates.color) {
            markerObject.material.color.set(updates.color);
        }

        // 更新透明度
        if (updates.opacity !== undefined) {
            markerObject.material.opacity = updates.opacity;
        }

        // 更新数据
        Object.assign(markerData, updates);
        this.markerDataMap.set(id, markerData);
    }

    /**
     * 移除点位
     * @param {string} id - 点位 ID
     */
    removeMarker(id) {
        const markerObject = this.imageMarkers.get(id);

        if (!markerObject) {
            console.warn(`ImageMarker: Marker "${id}" not found`);
            return;
        }

        // 从场景中移除
        this.remove(markerObject);

        // 释放资源
        if (markerObject.geometry) {
            markerObject.geometry.dispose();
        }
        if (markerObject.material) {
            markerObject.material.dispose();
        }

        // 从映射表中移除
        this.imageMarkers.delete(id);
        this.markerDataMap.delete(id);

        // 触发事件
        this.emit('markerRemoved', { markerId: id });
    }

    /**
     * 获取点位数据
     * @param {string} id - 点位 ID
     * @returns {Object|null}
     */
    getMarker(id) {
        return this.markerDataMap.get(id) || null;
    }

    /**
     * 获取所有点位数据
     * @returns {Array}
     */
    getAllMarkers() {
        return Array.from(this.markerDataMap.values());
    }

    /**
     * 清除所有点位
     */
    clearMarkers() {
        const ids = Array.from(this.imageMarkers.keys());
        ids.forEach((id) => this.removeMarker(id));
    }

    // ==================== 鼠标交互相关方法 ====================

    /**
     * 设置鼠标事件监听
     */
    setupMouseEvents() {
        if (!this.scene || !this.scene.renderer || !this.scene.renderer.domElement) {
            console.warn(
                '[ImageMarker] Cannot setup mouse events: scene/renderer/domElement not ready'
            );
            return;
        }

        const domElement = this.scene.renderer.domElement;

        // 绑定事件处理函数（保存引用以便后续移除）
        this.onMouseClick = this.handleMouseClick.bind(this);
        this.onMouseMove = this.handleMouseMove.bind(this);

        // 添加事件监听
        domElement.addEventListener('click', this.onMouseClick);
        domElement.addEventListener('mousemove', this.onMouseMove);

        console.log('[ImageMarker] Mouse events setup successfully');
    }

    /**
     * 移除鼠标事件监听
     */
    removeMouseEvents() {
        if (!this.scene || !this.scene.renderer || !this.scene.renderer.domElement) {
            return;
        }

        const domElement = this.scene.renderer.domElement;

        // 移除事件监听
        if (this.onMouseClick) {
            domElement.removeEventListener('click', this.onMouseClick);
        }
        if (this.onMouseMove) {
            domElement.removeEventListener('mousemove', this.onMouseMove);
        }
    }

    /**
     * 处理鼠标点击事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseClick(event) {
        console.log('[ImageMarker] handleMouseClick called', {
            clientX: event.clientX,
            clientY: event.clientY
        });

        const intersectedMarker = this.getIntersectedMarker(event);

        console.log('[ImageMarker] Intersected marker:', intersectedMarker);

        if (intersectedMarker) {
            const markerId = intersectedMarker.userData.markerId;
            const markerData = this.markerDataMap.get(markerId);

            console.log('[ImageMarker] Emitting markerClick event:', { markerId, markerData });

            // 触发点击事件
            this.emit('markerClick', {
                markerId,
                markerData,
                markerObject: intersectedMarker
            });
        } else {
            console.log('[ImageMarker] No marker intersected');
        }
    }

    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseMove(event) {
        const intersectedMarker = this.getIntersectedMarker(event);

        // 检查鼠标移入/移出
        if (intersectedMarker) {
            const markerId = intersectedMarker.userData.markerId;

            // 如果是新的点位，触发移入事件
            if (!this.hoveredMarker || this.hoveredMarker.userData.markerId !== markerId) {
                // 先触发之前点位的移出事件
                if (this.hoveredMarker) {
                    const prevMarkerId = this.hoveredMarker.userData.markerId;
                    const prevMarkerData = this.markerDataMap.get(prevMarkerId);

                    this.emit('markerMouseLeave', {
                        markerId: prevMarkerId,
                        markerData: prevMarkerData,
                        markerObject: this.hoveredMarker
                    });
                }

                // 触发新点位的移入事件
                const markerData = this.markerDataMap.get(markerId);
                this.emit('markerMouseEnter', {
                    markerId,
                    markerData,
                    markerObject: intersectedMarker
                });

                this.hoveredMarker = intersectedMarker;
            }
        } else {
            // 鼠标不在任何点位上，触发移出事件
            if (this.hoveredMarker) {
                const markerId = this.hoveredMarker.userData.markerId;
                const markerData = this.markerDataMap.get(markerId);

                this.emit('markerMouseLeave', {
                    markerId,
                    markerData,
                    markerObject: this.hoveredMarker
                });

                this.hoveredMarker = null;
            }
        }
    }

    /**
     * 获取鼠标位置相交的点位
     * @param {MouseEvent} event - 鼠标事件
     * @returns {THREE.Object3D|null}
     */
    getIntersectedMarker(event) {
        if (!this.scene || !this.scene.camera || !this.scene.renderer) {
            console.warn('[ImageMarker] getIntersectedMarker: scene/camera/renderer not ready');
            return null;
        }

        const domElement = this.scene.renderer.domElement;
        const rect = domElement.getBoundingClientRect();

        // 计算鼠标在 Three.js 坐标系中的位置（-1 到 1）
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        console.log('[ImageMarker] Mouse position:', {
            normalized: { x: this.mouse.x, y: this.mouse.y },
            client: { x: event.clientX, y: event.clientY },
            rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
        });

        // 更新射线
        this.raycaster.setFromCamera(this.mouse, this.scene.camera);

        // 获取所有点位对象
        const markerObjects = Array.from(this.imageMarkers.values());

        console.log('[ImageMarker] Marker objects count:', markerObjects.length);
        console.log('[ImageMarker] Marker objects:', markerObjects);

        if (markerObjects.length === 0) {
            console.warn('[ImageMarker] No marker objects to intersect');
            return null;
        }

        // 检测相交（不递归检测子对象，因为 Sprite 和 Plane 都是单个对象）
        const intersects = this.raycaster.intersectObjects(markerObjects, false);

        console.log('[ImageMarker] Intersects:', intersects);
        console.log('[ImageMarker] Raycaster params:', this.raycaster.params);

        if (intersects.length > 0) {
            console.log('[ImageMarker] Found intersection:', intersects[0]);
            // 返回相交的对象
            return intersects[0].object;
        }

        console.log('[ImageMarker] No intersection found');
        return null;
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 移除鼠标事件监听
        this.removeMouseEvents();

        // 清除所有图片点位
        this.clearMarkers();

        // 清除纹理缓存
        this.textureCache.forEach((texture) => {
            texture.dispose();
        });
        this.textureCache.clear();
    }
}

export default ImageMarker;
