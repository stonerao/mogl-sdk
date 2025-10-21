import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * DXFLoader DXF 文件加载器组件
 *
 * @class DXFLoader
 * @extends Component
 * @description 加载和渲染 DXF 文件，支持 2D CAD 图纸显示
 * 使用 dxf-viewer 库 (https://github.com/vagran/dxf-viewer)
 *
 * @example
 * // 加载 DXF 文件
 * const dxfViewer = await scene.add('DXFLoader', {
 *     name: 'cad-drawing',
 *     url: '/models/demo.dxf',
 *     position: [0, 0, 0]
 * });
 *
 * // 监听加载进度
 * dxfViewer.on('loadProgress', (event) => {
 *     console.log('Loading:', event.progress * 100 + '%');
 * });
 */
export class DXFLoader extends Component {
    /**
     * 默认配置
     */
    static defaultConfig = {
        url: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
        // DXF 特定配置
        fonts: null, // 字体文件 URL 数组，用于文本渲染
        clearColor: new THREE.Color('#000000'), // 背景颜色
        clearAlpha: 0, // 背景透明度
        autoResize: false, // 是否自动调整大小
        colorCorrection: true, // 是否进行颜色校正
        // 显示选项
        showLayers: true,
        visibleLayers: null, // null 表示显示所有图层，或者传入图层名称数组
        // 交互选项
        enableInteraction: true,
        // 查看器选项
        canvasAlpha: true,
        canvasPremultipliedAlpha: false,
        antialias: true,
        preserveDrawingBuffer: false
    };

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 初始化变量
        this.dxfData = null;
        this.viewer = null;
        this.dxfGroup = null;
        this.interactiveObjects = [];
        this.layersMap = new Map();

        // 异步加载 DXF 文件
        this.loadDXF()
            .then(() => {
                // DXF 加载完成后的后续操作
                this.setupInteractiveObjects();
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error('DXFLoader: DXF loading failed in onMounted', error);
            });
    }

    /**
     * 加载 DXF 文件
     */
    async loadDXF() {
        if (!this.config.url) {
            // eslint-disable-next-line no-console
            console.warn('DXFLoader: url is required');
            return;
        }

        try {
            // 触发加载开始事件
            this.emit('loadStart', { url: this.config.url });

            // 使用 fetch 加载 DXF 文件内容
            // eslint-disable-next-line no-undef
            const response = await fetch(this.config.url);
            if (!response.ok) {
                throw new Error(`Failed to load DXF file: ${response.statusText}`);
            }

            const dxfString = await response.text();

            // 触发进度事件
            this.emit('loadProgress', { progress: 0.5 });

            // 使用 dxf-parser 解析 DXF
            const { default: DxfParser } = await import('dxf-parser');
            const parser = new DxfParser();
            this.dxfData = parser.parseSync(dxfString);

            if (!this.dxfData) {
                throw new Error('Failed to parse DXF file');
            }

            // eslint-disable-next-line no-console
            console.log('DXF parsed successfully:', this.dxfData);

            // 触发进度事件
            this.emit('loadProgress', { progress: 0.75 });

            // 创建 Three.js 几何体
            this.createGeometry();

            // 应用变换
            this.applyTransform();

            // 处理图层可见性
            if (this.config.visibleLayers) {
                this.setVisibleLayers(this.config.visibleLayers);
            }

            /* 初始化位置 */
            const box = new THREE.Box3().setFromObject(this.dxfGroup);
            this.dxfGroup.position.set(
                -box.min.x - (box.max.x - box.min.x) / 2,
                -box.min.y - (box.max.y - box.min.y) / 2,
                -box.min.z - (box.max.z - box.min.z) / 2
            );

            // 触发进度事件
            this.emit('loadProgress', { progress: 1.0 });

            // 触发加载完成事件
            this.emit('loadComplete', {
                dxfData: this.dxfData
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('DXFLoader: Failed to load DXF file', error);
            this.emit('error', { error, url: this.config.url });
            throw error;
        }
    }

    /**
     * 创建 Three.js 几何体
     */
    createGeometry() {
        if (!this.dxfData) {
            return;
        }

        try {
            // 创建一个组来容纳 DXF 内容
            this.dxfGroup = new THREE.Group();
            this.dxfGroup.name = 'DXF_Content';

            // 获取图层信息
            if (this.dxfData.tables && this.dxfData.tables.layer) {
                Object.keys(this.dxfData.tables.layer.layers).forEach((layerName) => {
                    const layer = this.dxfData.tables.layer.layers[layerName];
                    this.layersMap.set(layerName, {
                        name: layerName,
                        displayName: layerName,
                        color: layer.color || 7, // 默认白色
                        visible: true
                    });
                });
            }

            // 处理实体
            if (this.dxfData.entities && this.dxfData.entities.length > 0) {
                this.dxfData.entities.forEach((entity) => {
                    const object = this.createEntityObject(entity);
                    if (object) {
                        this.dxfGroup.add(object);
                    }
                });
            }

            // 添加到组件场景
            this.add(this.dxfGroup);
            // 计算this.dxfGroup的box大小
            this.dxfGroup.updateMatrixWorld();
            this.dxfGroup.geometryBBox = new THREE.Box3().setFromObject(this.dxfGroup);
            this.dxfGroup.geometryCenter = this.dxfGroup.geometryBBox.getCenter(
                new THREE.Vector3()
            );
            this.dxfGroup.geometrySize = this.dxfGroup.geometryBBox.getSize(new THREE.Vector3());
            this.dxfGroup.geometryScale = this.dxfGroup.geometrySize.length();
            this.dxfGroup.geometryAspect =
                this.dxfGroup.geometrySize.x / this.dxfGroup.geometrySize.y;

            // eslint-disable-next-line no-console
            console.log('DXF geometry created, entities:', this.dxfData.entities?.length || 0);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('DXFLoader: Failed to create geometry', error);
            throw error;
        }
    }

    /**
     * 根据 DXF 实体创建 Three.js 对象
     */
    createEntityObject(entity) {
        try {
            let object = null;

            switch (entity.type) {
            case 'LINE':
                object = this.createLine(entity);
                break;
            case 'LWPOLYLINE':
            case 'POLYLINE':
                object = this.createPolyline(entity);
                break;
            case 'CIRCLE':
                object = this.createCircle(entity);
                break;
            case 'ARC':
                object = this.createArc(entity);
                break;
            case 'SPLINE':
                object = this.createSpline(entity);
                break;
            default:
                // 暂不支持的实体类型
                break;
            }

            if (object && entity.layer) {
                object.userData.layer = entity.layer;
            }

            return object;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('DXFLoader: Failed to create entity:', entity.type, error);
            return null;
        }
    }

    /**
     * 创建线段
     */
    createLine(entity) {
        const points = [];
        points.push(
            new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z || 0)
        );
        points.push(
            new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z || 0)
        );

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.getEntityColor(entity)
        });

        return new THREE.Line(geometry, material);
    }

    /**
     * 创建多段线
     */
    createPolyline(entity) {
        const points = [];
        entity.vertices.forEach((vertex) => {
            points.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z || 0));
        });

        // 如果是闭合的多段线，添加第一个点到末尾
        if (entity.shape && points.length > 0) {
            points.push(points[0].clone());
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.getEntityColor(entity)
        });

        return new THREE.Line(geometry, material);
    }

    /**
     * 创建圆
     */
    createCircle(entity) {
        const curve = new THREE.EllipseCurve(
            entity.center.x,
            entity.center.y,
            entity.radius,
            entity.radius,
            0,
            2 * Math.PI,
            false,
            0
        );

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.getEntityColor(entity)
        });

        const circle = new THREE.Line(geometry, material);
        circle.position.z = entity.center.z || 0;

        return circle;
    }

    /**
     * 创建圆弧
     */
    createArc(entity) {
        const curve = new THREE.EllipseCurve(
            entity.center.x,
            entity.center.y,
            entity.radius,
            entity.radius,
            entity.startAngle,
            entity.endAngle,
            false,
            0
        );

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.getEntityColor(entity)
        });

        const arc = new THREE.Line(geometry, material);
        arc.position.z = entity.center.z || 0;

        return arc;
    }

    /**
     * 创建样条曲线
     */
    createSpline(entity) {
        if (!entity.controlPoints || entity.controlPoints.length < 2) {
            return null;
        }

        const points = entity.controlPoints.map((cp) => new THREE.Vector3(cp.x, cp.y, cp.z || 0));

        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const material = new THREE.LineBasicMaterial({
            color: this.getEntityColor(entity)
        });

        return new THREE.Line(geometry, material);
    }

    /**
     * 获取实体颜色
     */
    getEntityColor(entity) {
        // AutoCAD 颜色索引表（简化版）
        const autocadColors = {
            1: 0xff0000, // 红色
            2: 0xffff00, // 黄色
            3: 0x00ff00, // 绿色
            4: 0x00ffff, // 青色
            5: 0x0000ff, // 蓝色
            6: 0xff00ff, // 洋红
            7: 0xffffff, // 白色
            8: 0x808080, // 灰色
            9: 0xc0c0c0 // 浅灰色
        };

        if (entity.color !== undefined && entity.color !== 256) {
            // 256 表示使用图层颜色
            return autocadColors[entity.color] || 0xffffff;
        }

        // 使用图层颜色
        if (entity.layer && this.layersMap.has(entity.layer)) {
            const layerColor = this.layersMap.get(entity.layer).color;
            return autocadColors[layerColor] || 0xffffff;
        }

        return 0xffffff; // 默认白色
    }

    /**
     * 应用变换（位置、旋转、缩放）
     */
    applyTransform() {
        if (!this.dxfGroup) {
            return;
        }

        // 应用位置
        if (this.config.position) {
            const [x, y, z] = this.config.position;
            this.dxfGroup.position.set(x, y, z);
        }

        // 应用旋转
        if (this.config.rotation) {
            const [x, y, z] = this.config.rotation;
            this.dxfGroup.rotation.set(x, y, z);
        }

        // 应用缩放
        if (this.config.scale) {
            const scale = this.config.scale;
            if (typeof scale === 'number') {
                this.dxfGroup.scale.set(scale, scale, scale);
            } else if (Array.isArray(scale)) {
                const [sx, sy, sz] = scale;
                this.dxfGroup.scale.set(sx, sy, sz);
            }
        }
    }

    /**
     * 设置可见图层
     * @param {Array<string>} layerNames - 图层名称数组
     */
    setVisibleLayers(layerNames) {
        if (!this.dxfGroup) {
            return;
        }

        const layerSet = new Set(layerNames);

        this.dxfGroup.traverse((object) => {
            if (object.userData && object.userData.layer) {
                object.visible = layerSet.has(object.userData.layer);
            }
        });
    }

    /**
     * 获取所有图层名称
     * @returns {Array<string>} 图层名称数组
     */
    getLayers() {
        return Array.from(this.layersMap.keys());
    }

    /**
     * 获取图层详细信息
     * @returns {Array<{name: string, displayName: string, color: number}>} 图层信息数组
     */
    getLayersInfo() {
        return Array.from(this.layersMap.values());
    }

    /**
     * 显示/隐藏图层
     * @param {string} layerName - 图层名称
     * @param {boolean} visible - 是否可见
     */
    setLayerVisible(layerName, visible) {
        // 更新本地图层映射
        const layerInfo = this.layersMap.get(layerName);
        if (layerInfo) {
            layerInfo.visible = visible;
        }

        // 更新组件场景中的对象可见性
        if (this.dxfGroup) {
            this.dxfGroup.traverse((object) => {
                if (object.userData && object.userData.layer === layerName) {
                    object.visible = visible;
                }
            });
        }
    }

    /**
     * 设置交互对象
     */
    setupInteractiveObjects() {
        if (!this.config.enableInteraction || !this.dxfGroup) {
            return;
        }

        // 收集所有可交互的对象
        this.interactiveObjects = [];
        this.dxfGroup.traverse((object) => {
            if (object.isMesh || object.isLine) {
                this.interactiveObjects.push(object);
            }
        });
    }

    /**
     * 获取可交互对象列表
     * @returns {Array} 可交互对象数组
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 清理 DXF 数据
        this.dxfData = null;

        // 清理几何体和材质
        if (this.dxfGroup) {
            this.dxfGroup.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            this.dxfGroup = null;
        }

        // 清理图层映射
        this.layersMap.clear();

        // 清理交互对象
        this.interactiveObjects = [];
    }
}
