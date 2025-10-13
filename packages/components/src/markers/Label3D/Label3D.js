import { Component } from '@w3d/core';
import { EventTypes } from '@w3d/core';
import * as THREE from 'three';

/**
 * Label3D 三维标签组件
 *
 * @class Label3D
 * @extends Component
 * @description 使用 Canvas 生成文字纹理，通过 Sprite 渲染到三维场景中
 */
export class Label3D extends Component {
    static defaultConfig = {
        labels: [], // 标签数据数组
        globalConfig: {
            // 全局默认配置
            fontSize: 32,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            textColor: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: '#ffffff',
            borderWidth: 2,
            padding: 10,
            borderRadius: 5,
            backgroundImage: null, // 背景图片 URL
            billboard: true, // 是否始终面向相机
            scale: 1, // 整体缩放
            depthTest: true, // 是否进行深度测试
            sizeAttenuation: true // 是否随距离缩放
        }
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 标签对象映射表 (id -> sprite)
        this.labelSprites = new Map();

        // 标签数据映射表 (id -> labelData)
        this.labelDataMap = new Map();

        // Canvas 缓存
        this.canvasCache = new Map();

        // 图片加载缓存
        this.imageCache = new Map();
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

        // 创建所有标签
        if (this.config.labels && this.config.labels.length > 0) {
            await this.createLabels(this.config.labels);
        }
    }

    /**
     * 创建标签
     * @param {Array} labels - 标签数据数组
     */
    async createLabels(labels) {
        for (const labelData of labels) {
            await this.createLabel(labelData);
        }
    }

    /**
     * 创建单个标签
     * @param {Object} labelData - 标签数据
     */
    async createLabel(labelData) {
        const { id, label, position, userData, config } = labelData;

        if (!id || !label) {
            console.warn('Label3D: id and label are required');
            return;
        }

        // 合并配置
        const labelConfig = {
            ...this.globalConfig,
            ...config
        };

        // 加载背景图片（如果有）
        let backgroundImage = null;
        if (labelConfig.backgroundImage) {
            backgroundImage = await this.loadImage(labelConfig.backgroundImage);
        }

        // 创建 Canvas 纹理
        const { canvas, width, height } = this.createCanvasTexture(
            label,
            labelConfig,
            backgroundImage
        );

        // 创建 Sprite 材质
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: labelConfig.depthTest,
            sizeAttenuation: labelConfig.sizeAttenuation
        });

        // 创建 Sprite
        const sprite = new THREE.Sprite(spriteMaterial);

        // 设置位置
        if (position) {
            sprite.position.set(position.x || 0, position.y || 0, position.z || 0);
        }

        // 设置缩放（根据 Canvas 实际尺寸）
        const scale = labelConfig.scale;
        const aspect = width / height;
        sprite.scale.set(aspect * scale, scale, 1);

        // 设置 userData
        sprite.userData = {
            labelId: id,
            labelText: label,
            customData: userData,
            eventEmitter: this.eventEmitter,
            isLabel3D: true
        };

        // 添加到场景
        this.add(sprite);

        // 保存到映射表
        this.labelSprites.set(id, sprite);
        this.labelDataMap.set(id, labelData);
    }

    /**
     * 创建 Canvas 纹理
     * @param {string} text - 文字内容
     * @param {Object} config - 配置
     * @param {Image} backgroundImage - 背景图片
     * @returns {Object} { canvas, width, height }
     */
    createCanvasTexture(text, config, backgroundImage = null) {
        const {
            fontSize,
            fontFamily,
            fontWeight,
            textColor,
            backgroundColor,
            borderColor,
            borderWidth,
            padding,
            borderRadius
        } = config;

        // 创建临时 Canvas 测量文字尺寸
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = tempCtx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        // 计算 Canvas 尺寸（包含 padding 和 border）
        const canvasWidth = Math.ceil(textWidth + padding * 2 + borderWidth * 2);
        const canvasHeight = Math.ceil(textHeight + padding * 2 + borderWidth * 2);

        // 创建实际 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        // 绘制背景图片
        if (backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
        } else {
            // 绘制背景
            ctx.fillStyle = backgroundColor;
            if (borderRadius > 0) {
                this.drawRoundedRect(
                    ctx,
                    borderWidth / 2,
                    borderWidth / 2,
                    canvasWidth - borderWidth,
                    canvasHeight - borderWidth,
                    borderRadius
                );
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            }
        }

        // 绘制边框
        if (borderWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            if (borderRadius > 0) {
                this.drawRoundedRect(
                    ctx,
                    borderWidth / 2,
                    borderWidth / 2,
                    canvasWidth - borderWidth,
                    canvasHeight - borderWidth,
                    borderRadius
                );
                ctx.stroke();
            } else {
                ctx.strokeRect(
                    borderWidth / 2,
                    borderWidth / 2,
                    canvasWidth - borderWidth,
                    canvasHeight - borderWidth
                );
            }
        }

        // 绘制文字
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

        return { canvas, width: canvasWidth, height: canvasHeight };
    }

    /**
     * 绘制圆角矩形路径
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * 加载图片
     * @param {string} url - 图片 URL
     * @returns {Promise<Image>}
     */
    loadImage(url) {
        // 检查缓存
        if (this.imageCache.has(url)) {
            return Promise.resolve(this.imageCache.get(url));
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.imageCache.set(url, img);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Label3D: Failed to load image: ${url}`);
                resolve(null);
            };
            img.src = url;
        });
    }

    /**
     * 更新标签
     * @param {string} id - 标签 ID
     * @param {Object} updates - 更新数据
     */
    async updateLabel(id, updates) {
        const sprite = this.labelSprites.get(id);
        const labelData = this.labelDataMap.get(id);

        if (!sprite || !labelData) {
            console.warn(`Label3D: Label with id "${id}" not found`);
            return;
        }

        // 更新标签数据
        Object.assign(labelData, updates);

        // 如果更新了文字或配置，重新创建纹理
        if (updates.label || updates.config) {
            const labelConfig = {
                ...this.globalConfig,
                ...labelData.config
            };

            let backgroundImage = null;
            if (labelConfig.backgroundImage) {
                backgroundImage = await this.loadImage(labelConfig.backgroundImage);
            }

            const { canvas, width, height } = this.createCanvasTexture(
                labelData.label,
                labelConfig,
                backgroundImage
            );

            sprite.material.map.image = canvas;
            sprite.material.map.needsUpdate = true;

            const scale = labelConfig.scale;
            const aspect = width / height;
            sprite.scale.set(aspect * scale, scale, 1);
        }

        // 如果更新了位置
        if (updates.position) {
            sprite.position.set(
                updates.position.x || sprite.position.x,
                updates.position.y || sprite.position.y,
                updates.position.z || sprite.position.z
            );
        }

        // 如果更新了 userData
        if (updates.userData) {
            sprite.userData.customData = updates.userData;
        }
    }

    /**
     * 移除标签
     * @param {string} id - 标签 ID
     */
    removeLabel(id) {
        const sprite = this.labelSprites.get(id);

        if (!sprite) {
            console.warn(`Label3D: Label with id "${id}" not found`);
            return;
        }

        // 清理资源
        if (sprite.material.map) {
            sprite.material.map.dispose();
        }
        sprite.material.dispose();

        // 从场景移除
        this.remove(sprite);

        // 从映射表移除
        this.labelSprites.delete(id);
        this.labelDataMap.delete(id);
    }

    /**
     * 获取标签
     * @param {string} id - 标签 ID
     * @returns {Object} 标签数据
     */
    getLabel(id) {
        return this.labelDataMap.get(id);
    }

    /**
     * 获取所有标签
     * @returns {Array} 标签数据数组
     */
    getAllLabels() {
        return Array.from(this.labelDataMap.values());
    }

    /**
     * 清除所有标签
     */
    clearLabels() {
        this.labelSprites.forEach((sprite, id) => {
            this.removeLabel(id);
        });
    }

    /**
     * 显示标签
     * @param {string} id - 标签 ID
     */
    showLabel(id) {
        const sprite = this.labelSprites.get(id);
        if (sprite) {
            sprite.visible = true;
        }
    }

    /**
     * 隐藏标签
     * @param {string} id - 标签 ID
     */
    hideLabel(id) {
        const sprite = this.labelSprites.get(id);
        if (sprite) {
            sprite.visible = false;
        }
    }

    /**
     * 获取可交互对象（用于事件系统）
     * @returns {Array<THREE.Object3D>}
     */
    getInteractiveObjects() {
        return Array.from(this.labelSprites.values());
    }

    /**
     * 每帧更新
     * @param {number} delta - 时间增量
     */
    onUpdate(delta) {
        // 如果启用了 billboard 效果，让标签始终面向相机
        if (this.globalConfig.billboard && this.scene.camera) {
            this.labelSprites.forEach((sprite) => {
                // Sprite 默认就是面向相机的，不需要额外处理
                // 如果使用 Plane，则需要手动设置朝向
            });
        }
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 清除所有标签
        this.clearLabels();

        // 清除缓存
        this.canvasCache.clear();
        this.imageCache.clear();
    }
}

export default Label3D;
