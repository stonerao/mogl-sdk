import { BaseNode } from '../BaseNode.js';
import * as THREE from 'three';

/**
 * ImageNode 图片节点
 * 
 * @class ImageNode
 * @extends BaseNode
 * @description 图片节点，支持加载和显示图片
 * 
 * @example
 * const image = new ImageNode(scene, {
 *     properties: {
 *         imageUrl: '/path/to/image.png',
 *         width: 200,
 *         height: 150
 *     }
 * });
 */
export class ImageNode extends BaseNode {
    /**
     * 节点类型
     */
    static nodeType = 'image';

    /**
     * 节点描述
     */
    static description = '图片节点';

    /**
     * 默认属性
     */
    static defaultProperties = {
        ...BaseNode.defaultProperties,
        imageUrl: '',
        width: 200,
        height: 150,
        fit: 'contain', // contain, cover, fill, none
        borderRadius: 0,
        borderColor: '#ffffff',
        borderWidth: 0
    };

    /**
     * 创建图片节点
     */
    onCreate() {
        super.onCreate();
        this.texture = null;
        this.textureLoader = new THREE.TextureLoader();
        this.isLoading = false;
        this.isLoaded = false;
        this.createGeometry();
    }

    /**
     * 创建几何体
     */
    createGeometry() {
        const { imageUrl, width, height } = this.properties;

        // 清除旧的几何体
        this.clear();

        // 创建占位符
        this.createPlaceholder(width, height);

        // 加载图片
        if (imageUrl) {
            this.loadImage(imageUrl);
        }
    }

    /**
     * 创建占位符
     */
    createPlaceholder(width, height) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'placeholder';
        this.add(mesh);

        // 添加图标（使用简单的几何体表示）
        this.createPlaceholderIcon(width, height);
    }

    /**
     * 创建占位符图标
     */
    createPlaceholderIcon(width, height) {
        const iconSize = Math.min(width, height) * 0.3;
        const geometry = new THREE.PlaneGeometry(iconSize, iconSize);
        const material = new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const icon = new THREE.Mesh(geometry, material);
        icon.name = 'icon';
        this.add(icon);
    }

    /**
     * 加载图片
     */
    loadImage(url) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.isLoaded = false;

        this.textureLoader.load(
            url,
            // 加载成功
            (texture) => {
                this.onImageLoaded(texture);
            },
            // 加载进度
            (progress) => {
                this.onImageProgress(progress);
            },
            // 加载失败
            (error) => {
                this.onImageError(error);
            }
        );
    }

    /**
     * 图片加载成功
     */
    onImageLoaded(texture) {
        this.isLoading = false;
        this.isLoaded = true;
        this.texture = texture;

        // 移除占位符
        const placeholder = this.getObjectByName('placeholder');
        const icon = this.getObjectByName('icon');
        if (placeholder) this.remove(placeholder);
        if (icon) this.remove(icon);

        // 创建图片网格
        this.createImageMesh();

        this.emit('image-loaded', { url: this.properties.imageUrl });
    }

    /**
     * 图片加载进度
     */
    onImageProgress(progress) {
        const percent = (progress.loaded / progress.total) * 100;
        this.emit('image-progress', { percent });
    }

    /**
     * 图片加载失败
     */
    onImageError(error) {
        this.isLoading = false;
        this.isLoaded = false;
        console.error('ImageNode: Failed to load image', error);
        this.emit('image-error', { error });
    }

    /**
     * 创建图片网格
     */
    createImageMesh() {
        const { width, height, fit, opacity } = this.properties;

        // 计算图片尺寸
        const imageAspect = this.texture.image.width / this.texture.image.height;
        const containerAspect = width / height;
        let meshWidth = width;
        let meshHeight = height;

        if (fit === 'contain') {
            if (imageAspect > containerAspect) {
                meshHeight = width / imageAspect;
            } else {
                meshWidth = height * imageAspect;
            }
        } else if (fit === 'cover') {
            if (imageAspect > containerAspect) {
                meshWidth = height * imageAspect;
            } else {
                meshHeight = width / imageAspect;
            }
        } else if (fit === 'none') {
            meshWidth = this.texture.image.width;
            meshHeight = this.texture.image.height;
        }

        const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);
        const material = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'image';
        this.add(mesh);

        // 创建边框
        const { borderWidth } = this.properties;
        if (borderWidth > 0) {
            this.createBorder(width, height);
        }
    }

    /**
     * 创建边框
     */
    createBorder(width, height) {
        const { borderColor, borderWidth, borderRadius } = this.properties;

        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        const r = Math.min(borderRadius, Math.min(width, height) / 2);

        if (r > 0) {
            // 圆角边框
            shape.moveTo(x + r, y);
            shape.lineTo(x + width - r, y);
            shape.quadraticCurveTo(x + width, y, x + width, y + r);
            shape.lineTo(x + width, y + height - r);
            shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
            shape.lineTo(x + r, y + height);
            shape.quadraticCurveTo(x, y + height, x, y + height - r);
            shape.lineTo(x, y + r);
            shape.quadraticCurveTo(x, y, x + r, y);
        } else {
            // 普通边框
            shape.moveTo(x, y);
            shape.lineTo(x + width, y);
            shape.lineTo(x + width, y + height);
            shape.lineTo(x, y + height);
            shape.lineTo(x, y);
        }

        const points = shape.getPoints();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(borderColor),
            linewidth: borderWidth
        });

        const line = new THREE.Line(geometry, material);
        line.name = 'border';
        this.add(line);
    }

    /**
     * 属性变化处理
     */
    onPropertyChange(key, newValue, oldValue) {
        super.onPropertyChange(key, newValue, oldValue);

        // 图片 URL 变化
        if (key === 'imageUrl') {
            this.createGeometry();
            return;
        }

        // 需要重新创建几何体的属性
        const geometryProps = ['width', 'height', 'fit', 'borderRadius', 'borderWidth'];
        if (geometryProps.includes(key) && this.isLoaded) {
            this.createImageMesh();
            return;
        }

        // 透明度变化
        if (key === 'opacity') {
            const imageMesh = this.getObjectByName('image');
            if (imageMesh && imageMesh.material) {
                imageMesh.material.opacity = newValue;
            }
        }

        // 边框颜色变化
        if (key === 'borderColor') {
            const borderLine = this.getObjectByName('border');
            if (borderLine && borderLine.material) {
                borderLine.material.color.set(newValue);
            }
        }
    }

    /**
     * 更新透明度
     */
    updateOpacity(opacity) {
        const imageMesh = this.getObjectByName('image');
        if (imageMesh && imageMesh.material) {
            imageMesh.material.opacity = opacity;
        }
    }

    /**
     * 获取边界框
     */
    getBoundingBox() {
        const { width, height } = this.properties;
        return new THREE.Box3(
            new THREE.Vector3(-width / 2, -height / 2, 0),
            new THREE.Vector3(width / 2, height / 2, 0)
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
    }

    /**
     * 序列化
     */
    toJSON() {
        return {
            ...super.toJSON(),
            nodeType: 'image'
        };
    }
}

