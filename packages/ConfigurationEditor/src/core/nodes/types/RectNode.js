import { BaseNode } from '../BaseNode.js';
import * as THREE from 'three';

/**
 * RectNode 矩形节点
 * 
 * @class RectNode
 * @extends BaseNode
 * @description 矩形节点，支持圆角、边框、填充等样式
 * 
 * @example
 * const rect = new RectNode(scene, {
 *     properties: {
 *         width: 200,
 *         height: 100,
 *         borderRadius: 10,
 *         color: '#409EFF',
 *         borderColor: '#ffffff',
 *         borderWidth: 2
 *     }
 * });
 */
export class RectNode extends BaseNode {
    /**
     * 节点类型
     */
    static nodeType = 'rect';

    /**
     * 节点描述
     */
    static description = '矩形节点';

    /**
     * 默认属性
     */
    static defaultProperties = {
        ...BaseNode.defaultProperties,
        width: 100,
        height: 100,
        borderRadius: 0,
        color: '#409EFF',
        borderColor: '#ffffff',
        borderWidth: 0,
        fillOpacity: 1,
        borderOpacity: 1
    };

    /**
     * 创建矩形节点
     */
    onCreate() {
        super.onCreate();
        this.createGeometry();
    }

    /**
     * 创建几何体
     */
    createGeometry() {
        const { width, height, borderRadius, color, borderColor, borderWidth, fillOpacity, borderOpacity } = this.properties;

        // 清除旧的几何体
        this.clear();

        // 创建填充矩形
        if (borderRadius > 0) {
            this.createRoundedRect(width, height, borderRadius, color, fillOpacity);
        } else {
            this.createPlainRect(width, height, color, fillOpacity);
        }

        // 创建边框
        if (borderWidth > 0) {
            this.createBorder(width, height, borderRadius, borderColor, borderWidth, borderOpacity);
        }
    }

    /**
     * 创建普通矩形
     */
    createPlainRect(width, height, color, opacity) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: opacity < 1,
            opacity: opacity,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'fill';
        this.add(mesh);
    }

    /**
     * 创建圆角矩形
     */
    createRoundedRect(width, height, radius, color, opacity) {
        // 创建圆角矩形的形状
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        const r = Math.min(radius, Math.min(width, height) / 2);

        shape.moveTo(x + r, y);
        shape.lineTo(x + width - r, y);
        shape.quadraticCurveTo(x + width, y, x + width, y + r);
        shape.lineTo(x + width, y + height - r);
        shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        shape.lineTo(x + r, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - r);
        shape.lineTo(x, y + r);
        shape.quadraticCurveTo(x, y, x + r, y);

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: opacity < 1,
            opacity: opacity,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'fill';
        this.add(mesh);
    }

    /**
     * 创建边框
     */
    createBorder(width, height, radius, color, borderWidth, opacity) {
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        const r = Math.min(radius, Math.min(width, height) / 2);

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
            color: new THREE.Color(color),
            linewidth: borderWidth,
            transparent: opacity < 1,
            opacity: opacity
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

        // 需要重新创建几何体的属性
        const geometryProps = ['width', 'height', 'borderRadius', 'borderWidth'];
        if (geometryProps.includes(key)) {
            this.createGeometry();
            return;
        }

        // 颜色变化
        if (key === 'color') {
            const fillMesh = this.getObjectByName('fill');
            if (fillMesh && fillMesh.material) {
                fillMesh.material.color.set(newValue);
            }
        }

        // 边框颜色变化
        if (key === 'borderColor') {
            const borderLine = this.getObjectByName('border');
            if (borderLine && borderLine.material) {
                borderLine.material.color.set(newValue);
            }
        }

        // 填充透明度变化
        if (key === 'fillOpacity') {
            const fillMesh = this.getObjectByName('fill');
            if (fillMesh && fillMesh.material) {
                fillMesh.material.opacity = newValue;
                fillMesh.material.transparent = newValue < 1;
            }
        }

        // 边框透明度变化
        if (key === 'borderOpacity') {
            const borderLine = this.getObjectByName('border');
            if (borderLine && borderLine.material) {
                borderLine.material.opacity = newValue;
                borderLine.material.transparent = newValue < 1;
            }
        }
    }

    /**
     * 更新颜色
     */
    updateColor(color) {
        const fillMesh = this.getObjectByName('fill');
        if (fillMesh && fillMesh.material) {
            fillMesh.material.color.set(color);
        }
    }

    /**
     * 更新透明度
     */
    updateOpacity(opacity) {
        const fillMesh = this.getObjectByName('fill');
        if (fillMesh && fillMesh.material) {
            fillMesh.material.opacity = opacity;
            fillMesh.material.transparent = opacity < 1;
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
     * 序列化
     */
    toJSON() {
        return {
            ...super.toJSON(),
            nodeType: 'rect'
        };
    }
}

