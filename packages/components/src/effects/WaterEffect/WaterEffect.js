import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * WaterEffect 水面效果组件
 *
 * @class WaterEffect
 * @extends Component
 */
export class WaterEffect extends Component {
    static defaultConfig = {
        width: 100,
        height: 100,
        color: '#0077be'
    };

    onMounted() {
        const geometry = new THREE.PlaneGeometry(this.config.width, this.config.height, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.1
        });

        this.water = new THREE.Mesh(geometry, material);
        this.water.rotation.x = -Math.PI / 2;
        this.add(this.water);
    }

    onDispose() {
        if (this.water) {
            this.water.geometry.dispose();
            this.water.material.dispose();
        }
    }
}

export default WaterEffect;
