import { BaseNode } from '../BaseNode.js';
import * as THREE from 'three';

/**
 * TextNode 文本节点
 * 
 * @class TextNode
 * @extends BaseNode
 * @description 文本节点，使用 Canvas 纹理渲染文本
 * 
 * @example
 * const text = new TextNode(scene, {
 *     properties: {
 *         text: 'Hello World',
 *         fontSize: 24,
 *         color: '#ffffff',
 *         fontFamily: 'Arial'
 *     }
 * });
 */
export class TextNode extends BaseNode {
    /**
     * 节点类型
     */
    static nodeType = 'text';

    /**
     * 节点描述
     */
    static description = '文本节点';

    /**
     * 默认属性
     */
    static defaultProperties = {
        ...BaseNode.defaultProperties,
        text: 'Text',
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'center',
        textBaseline: 'middle',
        backgroundColor: 'transparent',
        padding: 10,
        lineHeight: 1.2
    };

    /**
     * 创建文本节点
     */
    onCreate() {
        super.onCreate();
        this.canvas = null;
        this.context = null;
        this.texture = null;
        this.createGeometry();
    }

    /**
     * 创建几何体
     */
    createGeometry() {
        // 清除旧的几何体
        this.clear();

        // 创建 Canvas 纹理
        this.createCanvasTexture();

        // 创建 Sprite
        this.createSprite();
    }

    /**
     * 创建 Canvas 纹理
     */
    createCanvasTexture() {
        const { text, fontSize, fontFamily, fontWeight, fontStyle, color, textAlign, textBaseline, backgroundColor, padding } = this.properties;

        // 创建 Canvas
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
        }

        const ctx = this.context;

        // 设置字体
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        // 测量文本尺寸
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        // 设置 Canvas 尺寸（加上 padding）
        const canvasWidth = Math.ceil(textWidth + padding * 2);
        const canvasHeight = Math.ceil(textHeight + padding * 2);
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        // 重新设置字体（Canvas 尺寸改变后需要重新设置）
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        // 绘制背景
        if (backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        }

        // 绘制文本
        ctx.fillStyle = color;
        const x = canvasWidth / 2;
        const y = canvasHeight / 2;
        ctx.fillText(text, x, y);

        // 创建或更新纹理
        if (!this.texture) {
            this.texture = new THREE.CanvasTexture(this.canvas);
        } else {
            this.texture.needsUpdate = true;
        }

        // 保存尺寸信息
        this.textWidth = canvasWidth;
        this.textHeight = canvasHeight;
    }

    /**
     * 创建 Sprite
     */
    createSprite() {
        const material = new THREE.SpriteMaterial({
            map: this.texture,
            transparent: true,
            opacity: this.properties.opacity
        });

        const sprite = new THREE.Sprite(material);
        sprite.name = 'text';
        
        // 设置 Sprite 尺寸
        sprite.scale.set(this.textWidth, this.textHeight, 1);
        
        this.add(sprite);
    }

    /**
     * 属性变化处理
     */
    onPropertyChange(key, newValue, oldValue) {
        super.onPropertyChange(key, newValue, oldValue);

        // 需要重新创建纹理的属性
        const textureProps = ['text', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'color', 'textAlign', 'textBaseline', 'backgroundColor', 'padding'];
        if (textureProps.includes(key)) {
            this.createGeometry();
            return;
        }

        // 透明度变化
        if (key === 'opacity') {
            const sprite = this.getObjectByName('text');
            if (sprite && sprite.material) {
                sprite.material.opacity = newValue;
            }
        }
    }

    /**
     * 更新文本内容
     */
    updateText(text) {
        this.setProperty('text', text);
    }

    /**
     * 更新颜色
     */
    updateColor(color) {
        this.setProperty('color', color);
    }

    /**
     * 更新透明度
     */
    updateOpacity(opacity) {
        const sprite = this.getObjectByName('text');
        if (sprite && sprite.material) {
            sprite.material.opacity = opacity;
        }
    }

    /**
     * 数据更新回调
     */
    onDataUpdate(value) {
        super.onDataUpdate(value);
        // 将数据值显示为文本
        this.updateText(String(value));
    }

    /**
     * 获取边界框
     */
    getBoundingBox() {
        const halfWidth = this.textWidth / 2;
        const halfHeight = this.textHeight / 2;
        return new THREE.Box3(
            new THREE.Vector3(-halfWidth, -halfHeight, 0),
            new THREE.Vector3(halfWidth, halfHeight, 0)
        );
    }

    /**
     * 销毁
     */
    onDispose() {
        super.onDispose();

        // 清理纹理
        if (this.texture) {
            this.texture.dispose();
            this.texture = null;
        }

        // 清理 Canvas
        this.canvas = null;
        this.context = null;
    }

    /**
     * 序列化
     */
    toJSON() {
        return {
            ...super.toJSON(),
            nodeType: 'text'
        };
    }
}

