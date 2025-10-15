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
        // 创建形状
        const shape = this.createShape();

        // 创建几何体
        this.geometry = this.createGeometry(shape);

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
     * 创建 2D 形状
     * @returns {THREE.Shape}
     */
    createShape() {
        const shape = new THREE.Shape();

        // 处理点位数据
        const points = this.config.points;

        // 判断点位格式：2D [[x, y]] 或 3D [[x, y, z]]
        const is2D = points[0].length === 2;

        // 移动到起点
        if (is2D) {
            shape.moveTo(points[0][0], points[0][1]);
        } else {
            // 3D 点位，使用 x 和 z 坐标
            shape.moveTo(points[0][0], points[0][2]);
        }

        // 绘制路径
        for (let i = 1; i < points.length; i++) {
            if (is2D) {
                shape.lineTo(points[i][0], points[i][1]);
            } else {
                shape.lineTo(points[i][0], points[i][2]);
            }
        }

        return shape;
    }

    /**
     * 创建拉伸几何体
     * @param {THREE.Shape} shape - 2D 形状
     * @returns {THREE.ExtrudeGeometry}
     */
    createGeometry(shape) {
        // 合并拉伸设置
        const extrudeSettings = {
            ...this.config.extrudeSettings,
            depth: this.config.height
        };

        // 创建拉伸几何体
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // 计算法线
        geometry.computeVertexNormals();

        // 修复侧面 UV 映射
        this.fixSideUVMapping(geometry);

        return geometry;
    }

    /**
     * 修复侧面 UV 映射
     *
     * THREE.ExtrudeGeometry 的默认 UV 映射不适合纹理贴图，
     * 需要根据侧面的实际尺寸重新计算 UV 坐标
     *
     * @param {THREE.ExtrudeGeometry} geometry - 拉伸几何体
     */
    fixSideUVMapping(geometry) {
        const points = this.config.points;
        if (!points || points.length < 3) return;

        // 计算多边形的周长
        let perimeter = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const dx = p2[0] - p1[0];
            const dy = (p2[1] || 0) - (p1[1] || 0);
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }

        const height = this.config.height;
        const position = geometry.attributes.position;
        const uv = geometry.attributes.uv;

        // 获取所有顶点的 Y 坐标范围
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < position.count; i++) {
            const y = position.getY(i);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        // 为侧面顶点重新计算 UV
        // 侧面顶点的特征：Y 坐标在 minY 和 maxY 之间，且不在正面上
        const epsilon = 0.001;

        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);

            // 判断是否是正面顶点
            const isBottomFace = Math.abs(y - minY) < epsilon;
            const isTopFace = Math.abs(y - maxY) < epsilon;
            const isFace = isBottomFace || isTopFace;

            if (!isFace) {
                // 这是侧面顶点，重新计算 UV
                // U 坐标：根据顶点在周长上的位置
                // V 坐标：根据顶点的高度

                // 计算 V 坐标（高度方向）
                const v = (y - minY) / height;

                // 计算 U 坐标（周长方向）
                // 找到最接近的边
                let minDist = Infinity;
                let u = 0;
                let accumulatedLength = 0;

                for (let j = 0; j < points.length; j++) {
                    const p1 = points[j];
                    const p2 = points[(j + 1) % points.length];

                    // 计算点到边的距离
                    const x1 = p1[0];
                    const z1 = p1[1] !== undefined ? p1[1] : p1[2] || 0;
                    const x2 = p2[0];
                    const z2 = p2[1] !== undefined ? p2[1] : p2[2] || 0;

                    const edgeLength = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);

                    // 计算点在边上的投影
                    const dx = x2 - x1;
                    const dz = z2 - z1;
                    const t = Math.max(
                        0,
                        Math.min(1, ((x - x1) * dx + (z - z1) * dz) / (dx * dx + dz * dz))
                    );
                    const projX = x1 + t * dx;
                    const projZ = z1 + t * dz;

                    const dist = Math.sqrt((x - projX) ** 2 + (z - projZ) ** 2);

                    if (dist < minDist) {
                        minDist = dist;
                        u = (accumulatedLength + t * edgeLength) / perimeter;
                    }

                    accumulatedLength += edgeLength;
                }

                // 设置新的 UV 坐标
                uv.setXY(i, u, v);
            }
            // 正面的 UV 保持不变（使用 ExtrudeGeometry 的默认 UV）
        }

        uv.needsUpdate = true;
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
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);

            let color;

            // 判断顶点是否在正面（底部或顶部）
            // 正面的顶点 Y 坐标接近 minY（底部）或接近 maxY（顶部）
            const epsilon = 0.001;
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
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    async updateConfig(newConfig) {
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
