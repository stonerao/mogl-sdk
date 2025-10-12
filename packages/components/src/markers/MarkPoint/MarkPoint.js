import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * MarkPoint 标注点组件
 *
 * @class MarkPoint
 * @extends Component
 */
export class MarkPoint extends Component {
    static defaultConfig = {
        position: [0, 0, 0],
        color: '#ff0000',
        size: 1,
        label: ''
    };

    onMounted() {
        const geometry = new THREE.SphereGeometry(this.config.size, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: this.config.color });
        this.marker = new THREE.Mesh(geometry, material);

        const [x, y, z] = this.config.position;
        this.marker.position.set(x, y, z);

        this.add(this.marker);
    }

    onDispose() {
        if (this.marker) {
            this.marker.geometry.dispose();
            this.marker.material.dispose();
        }
    }
}

export default MarkPoint;
