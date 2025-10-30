import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * ExtrudedPolygon 拉伸多边形组件
 *
 * @class ExtrudedPolygon
 * @extends Component
 * @description 根据点位数据生成二维多边形平面，并进行垂直拉伸形成三维立体物体
 *
 * 支持侧面和正面独立配置纹理或颜色渐变
 *
 * @example
 * const polygon = await scene.add('ExtrudedPolygon', {
 *     points: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *     height: 5,
 *     side: {
 *         textureUrl: '/images/side.jpg',
 *         textureRepeat: [2, 1],
 *         useGradient: true,
 *         bottomColor: 0x00ff00,
 *         topColor: 0x0000ff
 *     },
 *     face: {
 *         textureUrl: '/images/face.jpg',
 *         textureRepeat: [2, 2],
 *         color: 0xff0000
 *     }
 * });
 */
export class ExtrudedPolygon extends Component {
    static defaultConfig = {
        // 点位数据（必需）
        points: [], // 格式: [[x1, y1], [x2, y2], ...] 或 [[x1, 0, z1], [x2, 0, z2], ...]

        // 拉伸高度
        height: 10,

        // 侧面配置（拉伸的垂直面）
        side: {
            // 纹理配置
            textureUrl: null, // 侧面纹理图片路径
            textureRepeat: [1, 1], // 侧面纹理重复次数 [U, V]

            // 颜色渐变配置
            useGradient: true, // 是否启用侧面渐变
            bottomColor: 0x00ff00, // 侧面底部颜色
            topColor: 0x0000ff // 侧面顶部颜色
        },

        // 正面配置（底部和顶部的 2D 多边形平面）
        face: {
            // 纹理配置
            textureUrl: null, // 正面纹理图片路径
            textureRepeat: [1, 1], // 正面纹理重复次数 [U, V]

            // 颜色配置
            useGradient: false, // 是否启用正面渐变
            bottomColor: 0xff0000, // 正面底部颜色（或纯色）
            topColor: 0xffff00, // 正面顶部颜色
            gradientAngle: 0 // 正面渐变角度（度），0° = 垂直，90° = 水平
        },

        // 材质配置
        material: {
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1.0,
            wireframe: false
        },

        // 拉伸配置
        extrudeSettings: {
            depth: 10, // 拉伸深度（与 height 参数关联）
            bevelEnabled: false, // 是否启用斜角
            bevelThickness: 0,
            bevelSize: 0,
            bevelSegments: 1
        },

        // 位置和旋转
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 几何体和材质
        this.geometry = null;
        this.materials = []; // 材质数组 [侧面材质, 正面材质]
        this.mesh = null;

        // 纹理加载器
        this.textureLoader = new THREE.TextureLoader();

        // 纹理对象
        this.sideTexture = null; // 侧面纹理
        this.faceTexture = null; // 正面纹理

        // 缓存标准化后的点位数据和几何体元数据
        this.normalizedPoints = null;
        this.sideVertexCount = 0; // 侧面顶点数量
        this.bottomVertexOffset = 0; // 底面顶点偏移
        this.topVertexOffset = 0; // 顶面顶点偏移
    }

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 验证点位数据
        if (!this.config.points || this.config.points.length < 3) {
            console.error('ExtrudedPolygon: At least 3 points are required');
            return;
        }

        // 创建拉伸多边形
        await this.createExtrudedPolygon();

        // 应用位置、旋转、缩放
        this.applyTransform();
    }

    /**
     * 创建拉伸多边形
     */
    async createExtrudedPolygon() {
        // 创建几何体
        this.geometry = this.createGeometry();

        // 创建材质
        await this.createMaterials();

        // 创建网格
        this.mesh = new THREE.Mesh(this.geometry, this.materials);
        this.add(this.mesh);

        // 如果侧面或正面启用了渐变，应用顶点颜色
        if (this.config.side.useGradient || this.config.face.useGradient) {
            this.applyGradient();
        }
    }

    /**
     * 创建拉伸几何体
     * 使用自定义算法实现拉伸，确保正确的 UV 映射和法线方向
     * @returns {THREE.BufferGeometry}
     */
    createGeometry() {
        const points = this.config.points;
        const height = this.config.height;

        // 标准化点位数据为 {x, z} 格式并缓存
        this.normalizedPoints = this.normalizePoints(points);

        // 创建 THREE.Shape 用于三角化
        const shape = new THREE.Shape();
        shape.moveTo(this.normalizedPoints[0].x, this.normalizedPoints[0].z);
        for (let i = 1; i < this.normalizedPoints.length; i++) {
            shape.lineTo(this.normalizedPoints[i].x, this.normalizedPoints[i].z);
        }

        // 使用 ShapeGeometry 进行三角化
        const shapeGeometry = new THREE.ShapeGeometry(shape);

        // 提取三角化后的顶点和索引
        const shapePositions = shapeGeometry.attributes.position.array;
        const shapeIndices = shapeGeometry.index ? shapeGeometry.index.array : null;

        // 构建完整的几何体数据
        const geometryData = this.buildExtrudedGeometry(
            this.normalizedPoints,
            shapePositions,
            shapeIndices,
            height
        );

        // 缓存顶点偏移信息，用于高度更新优化
        this.sideVertexCount = this.normalizedPoints.length * 4;
        this.bottomVertexOffset = this.sideVertexCount;
        const bottomFaceVertexCount = shapePositions.length / 3;
        this.topVertexOffset = this.bottomVertexOffset + bottomFaceVertexCount;

        // 创建 BufferGeometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(geometryData.positions, 3)
        );
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(geometryData.normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(geometryData.uvs, 2));
        geometry.setIndex(geometryData.indices);

        // 设置材质组
        geometry.addGroup(0, geometryData.sideIndicesCount, 0); // 侧面使用材质索引 0
        geometry.addGroup(
            geometryData.sideIndicesCount,
            geometryData.faceIndicesCount,
            1
        ); // 底面和顶面使用材质索引 1

        // 清理临时几何体
        shapeGeometry.dispose();

        return geometry;
    }

    /**
     * 标准化点位数据为 {x, z} 格式
     * @param {Array} points - 原始点位数据
     * @returns {Array} 标准化后的点位数组
     */
    normalizePoints(points) {
        const normalized = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (point.length === 2) {
                // 2D 格式: [x, z]
                normalized.push({ x: point[0], z: point[1] });
            } else {
                // 3D 格式: [x, y, z]，使用 x 和 z
                normalized.push({ x: point[0], z: point[2] || 0 });
            }
        }
        return normalized;
    }

    /**
     * 构建拉伸几何体的顶点、法线、UV 和索引数据
     * @param {Array} normalizedPoints - 标准化后的点位数组 [{x, z}, ...]
     * @param {Array} shapePositions - 三角化后的形状顶点数组
     * @param {Array} shapeIndices - 三角化后的形状索引数组
     * @param {number} height - 拉伸高度
     * @returns {Object} 包含 positions, normals, uvs, indices 的对象
     */
    buildExtrudedGeometry(normalizedPoints, shapePositions, shapeIndices, height) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // 计算多边形的边界框（用于 UV 映射）
        const bounds = this.calculateBounds(normalizedPoints);

        // 计算多边形的周长（用于侧面 UV 映射）
        const perimeter = this.calculatePerimeter(normalizedPoints);

        let vertexOffset = 0;

        // ========== 1. 生成侧面（Side Faces）==========
        const sideData = this.buildSideFaces(normalizedPoints, height, perimeter);
        positions.push(...sideData.positions);
        normals.push(...sideData.normals);
        uvs.push(...sideData.uvs);
        indices.push(...sideData.indices);
        vertexOffset += sideData.vertexCount;

        const sideIndicesCount = sideData.indices.length;

        // ========== 2. 生成底面（Bottom Face）==========
        const bottomData = this.buildBottomFace(shapePositions, shapeIndices, bounds);
        positions.push(...bottomData.positions);
        normals.push(...bottomData.normals);
        uvs.push(...bottomData.uvs);
        // 调整索引偏移
        const bottomIndices = bottomData.indices.map((idx) => idx + vertexOffset);
        indices.push(...bottomIndices);
        vertexOffset += bottomData.vertexCount;

        // ========== 3. 生成顶面（Top Face）==========
        const topData = this.buildTopFace(shapePositions, shapeIndices, bounds, height);
        positions.push(...topData.positions);
        normals.push(...topData.normals);
        uvs.push(...topData.uvs);
        // 调整索引偏移
        const topIndices = topData.indices.map((idx) => idx + vertexOffset);
        indices.push(...topIndices);

        const faceIndicesCount = bottomIndices.length + topIndices.length;

        return {
            positions,
            normals,
            uvs,
            indices,
            sideIndicesCount,
            faceIndicesCount
        };
    }

    /**
     * 计算多边形的边界框
     * @param {Array} points - 点位数组 [{x, z}, ...]
     * @returns {Object} {minX, maxX, minZ, maxZ, width, height}
     */
    calculateBounds(points) {
        let minX = Infinity,
            maxX = -Infinity;
        let minZ = Infinity,
            maxZ = -Infinity;

        for (const point of points) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minZ = Math.min(minZ, point.z);
            maxZ = Math.max(maxZ, point.z);
        }

        return {
            minX,
            maxX,
            minZ,
            maxZ,
            width: maxX - minX,
            height: maxZ - minZ
        };
    }

    /**
     * 计算多边形的周长
     * @param {Array} points - 点位数组 [{x, z}, ...]
     * @returns {number} 周长
     */
    calculatePerimeter(points) {
        let perimeter = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const dx = p2.x - p1.x;
            const dz = p2.z - p1.z;
            perimeter += Math.sqrt(dx * dx + dz * dz);
        }
        return perimeter;
    }

    /**
     * 构建侧面几何数据
     * @param {Array} points - 点位数组 [{x, z}, ...]
     * @param {number} height - 拉伸高度
     * @param {number} perimeter - 多边形周长
     * @returns {Object} {positions, normals, uvs, indices, vertexCount}
     */
    buildSideFaces(points, height, perimeter) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        let accumulatedLength = 0;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            // 计算边的长度
            const dx = p2.x - p1.x;
            const dz = p2.z - p1.z;
            const edgeLength = Math.sqrt(dx * dx + dz * dz);

            // 计算法线方向（垂直于边，朝外）
            const nx = -dz / edgeLength;
            const nz = dx / edgeLength;

            // UV 坐标
            const u1 = accumulatedLength / perimeter;
            const u2 = (accumulatedLength + edgeLength) / perimeter;

            // 当前边的顶点索引
            const baseIndex = i * 4;

            // 底部左顶点
            positions.push(p1.x, 0, p1.z);
            normals.push(nx, 0, nz);
            uvs.push(u1, 0.0);

            // 底部右顶点
            positions.push(p2.x, 0, p2.z);
            normals.push(nx, 0, nz);
            uvs.push(u2, 0.0);

            // 顶部右顶点
            positions.push(p2.x, height, p2.z);
            normals.push(nx, 0, nz);
            uvs.push(u2, 1.0);

            // 顶部左顶点
            positions.push(p1.x, height, p1.z);
            normals.push(nx, 0, nz);
            uvs.push(u1, 1.0);

            // 两个三角形（逆时针顺序，法线朝外）
            indices.push(baseIndex + 0, baseIndex + 1, baseIndex + 2);
            indices.push(baseIndex + 0, baseIndex + 2, baseIndex + 3);

            accumulatedLength += edgeLength;
        }

        return {
            positions,
            normals,
            uvs,
            indices,
            vertexCount: points.length * 4
        };
    }

    /**
     * 构建底面几何数据
     * @param {Array} shapePositions - 三角化后的形状顶点数组
     * @param {Array} shapeIndices - 三角化后的形状索引数组
     * @param {Object} bounds - 边界框信息
     * @returns {Object} {positions, normals, uvs, indices, vertexCount}
     */
    buildBottomFace(shapePositions, shapeIndices, bounds) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // 遍历三角化后的顶点
        const vertexCount = shapePositions.length / 3;
        for (let i = 0; i < vertexCount; i++) {
            const x = shapePositions[i * 3];
            const z = shapePositions[i * 3 + 1]; // ShapeGeometry 使用 xy 平面，我们映射到 xz

            // 位置：y = 0（底面）
            positions.push(x, 0, z);

            // 法线：朝下（-y）
            normals.push(0, -1, 0);

            // UV：顶视图投影
            const u = bounds.width > 0 ? (x - bounds.minX) / bounds.width : 0.5;
            const v = bounds.height > 0 ? (z - bounds.minZ) / bounds.height : 0.5;
            uvs.push(u, v);
        }

        // 索引：需要反转顺序使法线朝下
        if (shapeIndices) {
            for (let i = 0; i < shapeIndices.length; i += 3) {
                indices.push(shapeIndices[i + 2], shapeIndices[i + 1], shapeIndices[i + 0]);
            }
        } else {
            // 如果没有索引，按顺序创建
            for (let i = 0; i < vertexCount; i += 3) {
                indices.push(i + 2, i + 1, i + 0);
            }
        }

        return {
            positions,
            normals,
            uvs,
            indices,
            vertexCount
        };
    }

    /**
     * 构建顶面几何数据
     * @param {Array} shapePositions - 三角化后的形状顶点数组
     * @param {Array} shapeIndices - 三角化后的形状索引数组
     * @param {Object} bounds - 边界框信息
     * @param {number} height - 拉伸高度
     * @returns {Object} {positions, normals, uvs, indices, vertexCount}
     */
    buildTopFace(shapePositions, shapeIndices, bounds, height) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // 遍历三角化后的顶点
        const vertexCount = shapePositions.length / 3;
        for (let i = 0; i < vertexCount; i++) {
            const x = shapePositions[i * 3];
            const z = shapePositions[i * 3 + 1];

            // 位置：y = height（顶面）
            positions.push(x, height, z);

            // 法线：朝上（+y）
            normals.push(0, 1, 0);

            // UV：顶视图投影（与底面相同）
            const u = bounds.width > 0 ? (x - bounds.minX) / bounds.width : 0.5;
            const v = bounds.height > 0 ? (z - bounds.minZ) / bounds.height : 0.5;
            uvs.push(u, v);
        }

        // 索引：保持原顺序使法线朝上
        if (shapeIndices) {
            indices.push(...shapeIndices);
        } else {
            for (let i = 0; i < vertexCount; i++) {
                indices.push(i);
            }
        }

        return {
            positions,
            normals,
            uvs,
            indices,
            vertexCount
        };
    }

    /**
     * 创建材质
     *
     * THREE.ExtrudeGeometry 的材质组结构：
     * - 材质索引 0: 侧面（拉伸的垂直面 - side faces）
     * - 材质索引 1: 正面（底部和顶部的 2D 多边形平面 - lid/cap faces）
     *
     * 新的材质应用规则：
     * - 侧面：支持纹理贴图或颜色渐变
     * - 正面：支持纹理贴图或颜色渐变/纯色
     */
    async createMaterials() {
        const materialConfig = this.config.material;
        const sideConfig = this.config.side;
        const faceConfig = this.config.face;

        // ========== 侧面材质（拉伸的垂直面）==========
        let sideMaterial;

        if (sideConfig.textureUrl) {
            // 模式 A：纹理贴图
            try {
                this.sideTexture = await this.loadTexture(sideConfig.textureUrl);
                this.sideTexture.wrapS = THREE.RepeatWrapping;
                this.sideTexture.wrapT = THREE.RepeatWrapping;
                this.sideTexture.repeat.set(
                    sideConfig.textureRepeat[0],
                    sideConfig.textureRepeat[1]
                );

                sideMaterial = new THREE.MeshStandardMaterial({
                    map: this.sideTexture,
                    side: materialConfig.side,
                    transparent: materialConfig.transparent,
                    opacity: materialConfig.opacity,
                    wireframe: materialConfig.wireframe,
                    vertexColors: false // 使用纹理时不启用顶点颜色
                });
            } catch (error) {
                console.warn(
                    'ExtrudedPolygon: Failed to load side texture, using gradient instead'
                );
                // 纹理加载失败，回退到渐变模式
                sideMaterial = new THREE.MeshStandardMaterial({
                    color: sideConfig.useGradient ? 0xffffff : sideConfig.bottomColor,
                    side: materialConfig.side,
                    transparent: materialConfig.transparent,
                    opacity: materialConfig.opacity,
                    wireframe: materialConfig.wireframe,
                    vertexColors: sideConfig.useGradient
                });
            }
        } else {
            // 模式 B：颜色渐变或纯色
            sideMaterial = new THREE.MeshStandardMaterial({
                color: sideConfig.useGradient ? 0xffffff : sideConfig.bottomColor,
                side: materialConfig.side,
                transparent: materialConfig.transparent,
                opacity: materialConfig.opacity,
                wireframe: materialConfig.wireframe,
                vertexColors: sideConfig.useGradient // 启用渐变时使用顶点颜色
            });
        }

        // ========== 正面材质（底部和顶部的 2D 多边形平面）==========
        let faceMaterial;

        if (faceConfig.textureUrl) {
            // 模式 A：纹理贴图
            try {
                this.faceTexture = await this.loadTexture(faceConfig.textureUrl);
                this.faceTexture.wrapS = THREE.RepeatWrapping;
                this.faceTexture.wrapT = THREE.RepeatWrapping;
                this.faceTexture.repeat.set(
                    faceConfig.textureRepeat[0],
                    faceConfig.textureRepeat[1]
                );

                faceMaterial = new THREE.MeshStandardMaterial({
                    map: this.faceTexture,
                    side: materialConfig.side,
                    transparent: materialConfig.transparent,
                    opacity: materialConfig.opacity,
                    wireframe: materialConfig.wireframe,
                    vertexColors: false // 使用纹理时不启用顶点颜色
                });
            } catch (error) {
                console.warn('ExtrudedPolygon: Failed to load face texture, using color instead');
                // 纹理加载失败，回退到颜色模式
                faceMaterial = new THREE.MeshStandardMaterial({
                    color: faceConfig.useGradient ? 0xffffff : faceConfig.bottomColor,
                    side: materialConfig.side,
                    transparent: materialConfig.transparent,
                    opacity: materialConfig.opacity,
                    wireframe: materialConfig.wireframe,
                    vertexColors: faceConfig.useGradient
                });
            }
        } else {
            // 模式 B：颜色渐变或纯色
            faceMaterial = new THREE.MeshStandardMaterial({
                color: faceConfig.useGradient ? 0xffffff : faceConfig.bottomColor,
                side: materialConfig.side,
                transparent: materialConfig.transparent,
                opacity: materialConfig.opacity,
                wireframe: materialConfig.wireframe,
                vertexColors: faceConfig.useGradient // 启用渐变时使用顶点颜色
            });
        }

        // 材质数组顺序：[侧面材质, 正面材质]
        // 对应 ExtrudeGeometry 的材质组索引：[0: 侧面, 1: 正面（底部和顶部）]
        this.materials = [sideMaterial, faceMaterial];
    }

    /**
     * 加载纹理
     * @param {string} url - 纹理 URL
     * @returns {Promise<THREE.Texture>}
     */
    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
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

    /**
     * 应用颜色渐变
     *
     * 支持侧面和正面的独立渐变配置
     * - 侧面渐变：基于 Y 轴方向（垂直渐变）
     * - 正面渐变：基于指定角度的方向渐变，支持旋转
     */
    applyGradient() {
        if (!this.geometry) return;

        const positionAttribute = this.geometry.attributes.position;
        const colors = [];

        // 获取所有坐标的边界
        let minX = Infinity,
            maxX = -Infinity;
        let minY = Infinity,
            maxY = -Infinity;
        let minZ = Infinity,
            maxZ = -Infinity;

        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
        }

        const rangeY = maxY - minY;
        const rangeX = maxX - minX;
        const rangeZ = maxZ - minZ;

        // 侧面渐变颜色
        const sideBottomColor = new THREE.Color(this.config.side.bottomColor);
        const sideTopColor = new THREE.Color(this.config.side.topColor);

        // 正面渐变颜色
        const faceBottomColor = new THREE.Color(this.config.face.bottomColor);
        const faceTopColor = new THREE.Color(this.config.face.topColor);

        // 正面渐变角度（转换为弧度）
        const angleRad = (this.config.face.gradientAngle * Math.PI) / 180;

        // 为每个顶点计算颜色
        const epsilon = 0.001;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);

            let color;

            // 判断顶点是否在正面（底部或顶部）
            const isBottomFace = Math.abs(y - minY) < epsilon;
            const isTopFace = Math.abs(y - maxY) < epsilon;
            const isFace = isBottomFace || isTopFace;

            if (isFace && this.config.face.useGradient) {
                // 正面渐变：根据角度计算渐变方向
                // 归一化 X 和 Z 坐标到 [0, 1]
                const normX = rangeX > 0 ? (x - minX) / rangeX : 0.5;
                const normZ = rangeZ > 0 ? (z - minZ) / rangeZ : 0.5;

                // 根据角度计算渐变插值因子
                // 0° = 沿 Z 轴（垂直），90° = 沿 X 轴（水平）
                const t = Math.cos(angleRad) * normZ + Math.sin(angleRad) * normX;

                // 限制 t 在 [0, 1] 范围内
                const clampedT = Math.max(0, Math.min(1, t));

                color = new THREE.Color().lerpColors(faceBottomColor, faceTopColor, clampedT);
            } else if (!isFace && this.config.side.useGradient) {
                // 侧面渐变：基于 Y 轴方向
                const t = rangeY > 0 ? (y - minY) / rangeY : 0;
                color = new THREE.Color().lerpColors(sideBottomColor, sideTopColor, t);
            } else {
                // 使用纯色
                if (isFace) {
                    color = new THREE.Color(this.config.face.bottomColor);
                } else {
                    color = new THREE.Color(this.config.side.bottomColor);
                }
            }

            colors.push(color.r, color.g, color.b);
        }

        // 添加颜色属性
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }

    /**
     * 应用变换（位置、旋转、缩放）
     */
    applyTransform() {
        if (!this.mesh) return;

        // 应用位置
        if (this.config.position) {
            this.position.set(...this.config.position);
        }

        // 应用旋转
        if (this.config.rotation) {
            this.rotation.set(...this.config.rotation);
        }

        // 应用缩放
        if (this.config.scale) {
            this.scale.set(...this.config.scale);
        }
    }

    /**
     * 优化的高度更新方法
     * 仅更新受高度影响的顶点位置，避免重新创建整个几何体
     * @param {number} newHeight - 新的拉伸高度
     */
    updateHeight(newHeight) {
        if (!this.geometry || !this.normalizedPoints) {
            // 如果几何体未初始化，使用完整更新
            this.config.height = newHeight;
            return;
        }

        // 更新配置
        this.config.height = newHeight;

        const positions = this.geometry.attributes.position.array;

        // 1. 更新侧面的顶部顶点（每条边有4个顶点，索引2和3是顶部顶点）
        for (let i = 0; i < this.normalizedPoints.length; i++) {
            // 每条边的顶点索引
            const baseIndex = i * 4;

            // 顶部右顶点 (索引 2)
            const topRightIndex = (baseIndex + 2) * 3;
            positions[topRightIndex + 1] = newHeight; // 更新 y 坐标

            // 顶部左顶点 (索引 3)
            const topLeftIndex = (baseIndex + 3) * 3;
            positions[topLeftIndex + 1] = newHeight; // 更新 y 坐标
        }

        // 2. 更新顶面的所有顶点
        // 顶面顶点从 topVertexOffset 开始
        const topFaceVertexCount = this.geometry.attributes.position.count - this.topVertexOffset;
        for (let i = 0; i < topFaceVertexCount; i++) {
            const vertexIndex = (this.topVertexOffset + i) * 3;
            positions[vertexIndex + 1] = newHeight; // 更新 y 坐标
        }

        // 标记位置属性需要更新
        this.geometry.attributes.position.needsUpdate = true;

        // 如果启用了渐变，需要重新应用（因为颜色可能基于高度）
        if (this.config.side.useGradient || this.config.face.useGradient) {
            this.applyGradient();
        }
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    async updateConfig(newConfig) {
        // 检查是否只更新高度，如果是则使用优化方法
        const isOnlyHeightUpdate =
            newConfig.height !== undefined &&
            Object.keys(newConfig).length === 1 &&
            this.geometry &&
            this.normalizedPoints;

        if (isOnlyHeightUpdate) {
            // 使用优化的高度更新方法
            this.updateHeight(newConfig.height);
            return;
        }

        // 深度合并配置（支持嵌套对象）
        if (newConfig.side) {
            this.config.side = { ...this.config.side, ...newConfig.side };
        }
        if (newConfig.face) {
            this.config.face = { ...this.config.face, ...newConfig.face };
        }
        if (newConfig.material) {
            this.config.material = { ...this.config.material, ...newConfig.material };
        }

        // 合并其他配置
        this.config = { ...this.config, ...newConfig };

        // 移除旧的网格
        if (this.mesh) {
            this.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.materials.forEach((mat) => mat.dispose());
        }

        // 清理旧纹理
        if (this.sideTexture) {
            this.sideTexture.dispose();
            this.sideTexture = null;
        }
        if (this.faceTexture) {
            this.faceTexture.dispose();
            this.faceTexture = null;
        }

        // 重新创建
        await this.createExtrudedPolygon();
        this.applyTransform();
    }

    /**
     * 组件销毁
     */
    onDestroy() {
        // 清理几何体
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }

        // 清理材质
        this.materials.forEach((material) => {
            if (material.map) {
                material.map.dispose();
            }
            material.dispose();
        });
        this.materials = [];

        // 清理纹理
        if (this.sideTexture) {
            this.sideTexture.dispose();
            this.sideTexture = null;
        }
        if (this.faceTexture) {
            this.faceTexture.dispose();
            this.faceTexture = null;
        }

        // 移除网格
        if (this.mesh) {
            this.remove(this.mesh);
            this.mesh = null;
        }
    }
}
