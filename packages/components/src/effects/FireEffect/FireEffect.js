import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * FireEffect 火焰效果组件
 *
 * @class FireEffect
 * @extends Component
 */
export class FireEffect extends Component {
    static defaultConfig = {
        size: 10,
        color: '#ff6600'
    };

    onMounted() {
        // 简化的火焰效果实现
        const geometry = new THREE.ConeGeometry(this.config.size, this.config.size * 2, 8);
        const material = new THREE.MeshBasicMaterial({
            color: this.config.color,
            transparent: true,
            opacity: 0.7
        });

        this.fire = new THREE.Mesh(geometry, material);
        this.add(this.fire);
    }

    onUpdate(delta) {
        if (this.fire) {
            this.fire.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.2;
        }
    }

    onDispose() {
        if (this.fire) {
            this.fire.geometry.dispose();
            this.fire.material.dispose();
        }
    }
}

export default FireEffect;
