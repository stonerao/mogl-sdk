import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * AreaBlock 区域块组件
 *
 * @class AreaBlock
 * @extends Component
 * @description 在三维空间中展示区域块，支持墙壁、底部和边框渲染，带云雾 Shader 效果
 */
export class AreaBlock extends Component {
    static defaultConfig = {
        areas: [], // 区域块数据数组
        globalConfig: {
            // 全局默认配置
            color: '#00ff00',
            showWall: true,
            showBottom: true,
            showBorder: true,
            wallHeight: 5,
            wallOpacity: 0.5,
            bottomOpacity: 0.5,
            borderWidth: 2,
            borderColor: null, // 默认使用 color
            borderGlow: true,
            animationSpeed: 1.0,
            opacity: 0.5
        }
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 区域块对象映射表 (id -> areaObject)
        this.areaBlocks = new Map();

        // 区域块数据映射表 (id -> areaData)
        this.areaDataMap = new Map();

        // 时钟
        this.clock = new THREE.Clock();
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

        // 创建所有区域块
        if (this.config.areas && this.config.areas.length > 0) {
            for (const areaData of this.config.areas) {
                await this.addArea(areaData);
            }
        }
    }

    /**
     * 组件更新
     */
    onUpdate() {
        const delta = this.clock.getDelta();

        // 更新所有区域块
        this.areaBlocks.forEach((areaObject) => {
            this.updateAreaBlock(areaObject, delta);
        });
    }

    // ==================== Shader 材质相关方法 ====================

    /**
     * 创建区域块的云雾 Shader 材质
     * @param {Object} config - 配置
     * @returns {THREE.ShaderMaterial}
     */
    createCloudShaderMaterial(config) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(1024, 1024) },
                color: { value: new THREE.Color(config.color || '#00ff00') },
                opacity: { value: config.wallOpacity || 0.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;

                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                uniform vec3 color;
                uniform float opacity;

                varying vec2 vUv;
                varying vec3 vPosition;

                // 随机纹理函数
                vec4 textureRND2D(vec2 uv) {
                    uv = floor(fract(uv) * 1e3);
                    float v = uv.x + uv.y * 1e3;
                    return fract(1e5 * sin(vec4(v * 1e-2, (v + 1.0) * 1e-2, (v + 1e3) * 1e-2, (v + 1e3 + 1.0) * 1e-2)));
                }

                // 噪声函数
                float noise(vec2 p) {
                    vec2 f = fract(p * 1e3);
                    vec4 r = textureRND2D(p);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
                }

                // 云雾函数
                float cloud(vec2 p) {
                    float v = 0.0;
                    v += noise(p * 1.0) * 0.50000;
                    v += noise(p * 2.0) * 0.2;
                    v += noise(p * 4.0) * 0.12500;
                    v += noise(p * 8.0) * 0.06250;
                    v += noise(p * 16.0) * 0.03125;
                    return v * v * v;
                }

                void main() {
                    vec2 p = vUv * 0.05 + 0.5;
                    vec3 c = vec3(0.0, 0.0, 0.2);

                    // 云雾效果
                    c.rgb += vec3(0.6, 0.6, 0.8) * cloud(p * 0.3 + time * 0.0002) * 0.6;
                    c.gbr += vec3(0.8, 0.8, 1.0) * cloud(p * 0.2 + time * 0.0002) * 0.8;
                    c.grb += vec3(1.0, 1.0, 1.0) * cloud(p * 0.1 + time * 0.0002) * 1.0;

                    // 应用颜色和透明度
                    vec3 finalColor = mix(c, color, 0.5);

                    gl_FragColor = vec4(finalColor, opacity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
    }

    // ==================== 区域块创建和管理方法 ====================

    /**
     * 创建区域块
     * @param {Array} points - 区域点数组
     * @param {Object} config - 配置
     * @returns {THREE.Group}
     */
    createAreaBlock(points, config) {
        if (!points || points.length < 3) {
            console.warn('AreaBlock: Area block requires at least 3 points');
            return null;
        }

        const group = new THREE.Group();
        group.userData.type = 'areaBlock';

        // 创建 2D 形状
        const shape = new THREE.Shape();
        shape.moveTo(points[0].x, points[0].z);
        for (let i = 1; i < points.length; i++) {
            shape.lineTo(points[i].x, points[i].z);
        }
        shape.lineTo(points[0].x, points[0].z); // 闭合

        // 创建墙壁面片（如果启用）
        if (config.showWall !== false) {
            const wallHeight = config.wallHeight || 5;

            // 创建墙壁几何体
            const wallGeometry = new THREE.BufferGeometry();
            const vertices = [];
            const uvs = [];
            const indices = [];

            // 为每条边创建墙壁面片
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];

                const baseIndex = i * 4;

                // 四个顶点（底部两个，顶部两个）
                vertices.push(
                    p1.x,
                    p1.y || 0,
                    p1.z,
                    p2.x,
                    p2.y || 0,
                    p2.z,
                    p1.x,
                    (p1.y || 0) + wallHeight,
                    p1.z,
                    p2.x,
                    (p2.y || 0) + wallHeight,
                    p2.z
                );

                // UV 坐标
                const segmentLength = Math.sqrt(
                    Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
                );
                uvs.push(0, 0, segmentLength / wallHeight, 0, 0, 1, segmentLength / wallHeight, 1);

                // 索引（两个三角形）
                indices.push(
                    baseIndex,
                    baseIndex + 1,
                    baseIndex + 2,
                    baseIndex + 1,
                    baseIndex + 3,
                    baseIndex + 2
                );
            }

            wallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            wallGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            wallGeometry.setIndex(indices);
            wallGeometry.computeVertexNormals();

            // 创建云雾材质
            const wallMaterial = this.createCloudShaderMaterial({
                ...config,
                opacity: config.wallOpacity || config.opacity || 0.5
            });
            const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
            wallMesh.userData.isWall = true;
            group.add(wallMesh);
        }

        // 创建底部面片（如果启用）
        if (config.showBottom !== false) {
            // 使用 ShapeGeometry 创建底部面片
            const bottomGeometry = new THREE.ShapeGeometry(shape);

            // 创建云雾材质（使用底部透明度）
            const bottomMaterial = this.createCloudShaderMaterial({
                ...config,
                opacity: config.bottomOpacity || config.opacity || 0.5
            });

            const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
            bottomMesh.rotation.x = -Math.PI / 2; // 旋转到水平面
            bottomMesh.position.y = 0; // 确保在 y=0 平面上
            bottomMesh.userData.isBottom = true;
            group.add(bottomMesh);
        }

        // 创建边框（如果启用）
        if (config.showBorder !== false) {
            const borderGeometry = new THREE.BufferGeometry();
            const borderVertices = [];

            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                borderVertices.push(p.x, p.y || 0, p.z);
            }
            // 闭合边框
            borderVertices.push(points[0].x, points[0].y || 0, points[0].z);

            borderGeometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(borderVertices, 3)
            );

            const borderMaterial = new THREE.LineBasicMaterial({
                color: new THREE.Color(config.borderColor || config.color || '#00ff00'),
                linewidth: config.borderWidth || 2,
                transparent: true,
                opacity: config.opacity || 0.8
            });

            const borderLine = new THREE.Line(borderGeometry, borderMaterial);
            borderLine.userData.isBorder = true;
            group.add(borderLine);
        }

        // 创建交互检测用的平面（不可见）
        const interactionGeometry = new THREE.ShapeGeometry(shape);
        const interactionMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const interactionMesh = new THREE.Mesh(interactionGeometry, interactionMaterial);
        interactionMesh.rotation.x = -Math.PI / 2; // 旋转到水平面
        interactionMesh.userData.isInteraction = true;
        interactionMesh.userData.areaId = config.id;
        group.add(interactionMesh);

        return group;
    }

    /**
     * 更新区域块动画
     * @param {THREE.Group} areaObject - 区域块对象
     * @param {number} delta - 时间增量
     */
    updateAreaBlock(areaObject, delta) {
        // 更新墙壁和底部材质的时间 uniform
        areaObject.children.forEach((child) => {
            if ((child.userData.isWall || child.userData.isBottom) && child.material.uniforms) {
                child.material.uniforms.time.value += delta;
            }
        });
    }

    /**
     * 添加区域块
     * @param {Object} areaData - 区域块数据
     */
    async addArea(areaData) {
        const { id, points, userData } = areaData;

        if (!id || !points || points.length < 3) {
            console.warn('AreaBlock: id and at least 3 points are required');
            return;
        }

        // 检查是否已存在
        if (this.areaBlocks.has(id)) {
            console.warn(`AreaBlock: Area with id "${id}" already exists`);
            return;
        }

        // 合并配置
        const areaConfig = {
            ...this.globalConfig,
            ...areaData,
            id
        };

        // 创建区域块
        const areaObject = this.createAreaBlock(points, areaConfig);
        if (!areaObject) return;

        // 设置 userData
        areaObject.userData = {
            ...userData,
            areaId: id,
            isAreaBlock: true
        };

        // 添加到场景
        this.add(areaObject);

        // 保存到映射表
        this.areaBlocks.set(id, areaObject);
        this.areaDataMap.set(id, areaData);

        // 触发事件
        this.emit('areaAdded', { areaId: id, areaData });
    }

    /**
     * 移除区域块
     * @param {string} id - 区域块 ID
     */
    removeArea(id) {
        const areaObject = this.areaBlocks.get(id);

        if (!areaObject) {
            console.warn(`AreaBlock: Area with id "${id}" not found`);
            return;
        }

        // 清理资源
        areaObject.children.forEach((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                child.material.dispose();
            }
        });

        // 从场景移除
        this.remove(areaObject);

        // 从映射表中移除
        this.areaBlocks.delete(id);
        this.areaDataMap.delete(id);

        // 触发事件
        this.emit('areaRemoved', { areaId: id });
    }

    /**
     * 获取区域块数据
     * @param {string} id - 区域块 ID
     * @returns {Object|null}
     */
    getArea(id) {
        return this.areaDataMap.get(id) || null;
    }

    /**
     * 获取所有区域块数据
     * @returns {Array}
     */
    getAllAreas() {
        return Array.from(this.areaDataMap.values());
    }

    /**
     * 清除所有区域块
     */
    clearAreas() {
        const ids = Array.from(this.areaBlocks.keys());
        ids.forEach((id) => this.removeArea(id));
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 清除所有区域块
        this.clearAreas();
    }
}

export default AreaBlock;
