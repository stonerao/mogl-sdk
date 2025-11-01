import { BaseNode } from '../BaseNode.js';
import * as THREE from 'three';

/**
 * CircleNode 圆形节点
 * 
 * @class CircleNode
 * @extends BaseNode
 * @description 圆形节点，支持边框、填充等样式
 * 
 * @example
 * const circle = new CircleNode(scene, {
 *     properties: {
 *         radius: 50,
 *         color: '#67C23A',
 *         borderColor: '#ffffff',
 *         borderWidth: 2
 *     }
 * });
 */
export class CircleNode extends BaseNode {
    /**
     * 节点类型
     */
    static nodeType = 'circle';

    /**
     * 节点描述
     */
    static description = '圆形节点';

    /**
     * 默认属性
     */
    static defaultProperties = {
        ...BaseNode.defaultProperties,
        radius: 50,
        segments: 32,
        color: '#67C23A',
        borderColor: '#ffffff',
        borderWidth: 0,
        fillOpacity: 1,
        borderOpacity: 1,
        startAngle: 0,
        endAngle: 360
    };

    /**
     * 创建圆形节点
     */
    onCreate() {
        super.onCreate();
        this.createGeometry();
    }

    /**
     * 创建几何体
     */
    createGeometry() {
        const { radius, segments, color, borderColor, borderWidth, fillOpacity, borderOpacity, startAngle, endAngle } = this.properties;

        // 清除旧的几何体
        this.clear();

        // 转换角度为弧度
        const thetaStart = THREE.MathUtils.degToRad(startAngle);
        const thetaLength = THREE.MathUtils.degToRad(endAngle - startAngle);

        // 创建填充圆形
        this.createFill(radius, segments, color, fillOpacity, thetaStart, thetaLength);

        // 创建边框
        if (borderWidth > 0) {
            this.createBorder(radius, segments, borderColor, borderWidth, borderOpacity, thetaStart, thetaLength);
        }
    }

    /**
     * 创建填充圆形
     */
    createFill(radius, segments, color, opacity, thetaStart, thetaLength) {
        const geometry = new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength);
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
    createBorder(radius, segments, color, borderWidth, opacity, thetaStart, thetaLength) {
        const points = [];
        const angleStep = thetaLength / segments;

        // 生成圆弧上的点
        for (let i = 0; i <= segments; i++) {
            const angle = thetaStart + i * angleStep;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            points.push(new THREE.Vector3(x, y, 0));
        }

        // 如果不是完整的圆，添加到中心的线
        if (thetaLength < Math.PI * 2) {
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(points[0]);
        }

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
        const geometryProps = ['radius', 'segments', 'borderWidth', 'startAngle', 'endAngle'];
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
        const { radius } = this.properties;
        return new THREE.Box3(
            new THREE.Vector3(-radius, -radius, 0),
            new THREE.Vector3(radius, radius, 0)
        );
    }

    /**
     * 序列化
     */
    toJSON() {
        return {
            ...super.toJSON(),
            nodeType: 'circle'
        };
    }
}

