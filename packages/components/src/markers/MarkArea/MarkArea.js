import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * MarkArea 标注区域组件
 *
 * @class MarkArea
 * @extends Component
 */
export class MarkArea extends Component {
    static defaultConfig = {
        width: 10,
        height: 10,
        color: '#0000ff',
        opacity: 0.3
    };

    onMounted() {
        const geometry = new THREE.PlaneGeometry(this.config.width, this.config.height);
        const material = new THREE.MeshBasicMaterial({
            color: this.config.color,
            transparent: true,
            opacity: this.config.opacity,
            side: THREE.DoubleSide
        });

        this.area = new THREE.Mesh(geometry, material);
        this.add(this.area);
    }

    onDispose() {
        if (this.area) {
            this.area.geometry.dispose();
            this.area.material.dispose();
        }
    }
}

export default MarkArea;
