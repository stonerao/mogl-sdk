import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * BoundingBoxHelper 包围盒辅助组件
 *
 * @class BoundingBoxHelper
 * @extends Component
 */
export class BoundingBoxHelper extends Component {
    static defaultConfig = {
        target: null,
        color: '#ffff00'
    };

    onMounted() {
        if (this.config.target) {
            const box = new THREE.Box3().setFromObject(this.config.target);
            this.helper = new THREE.Box3Helper(box, this.config.color);
            this.add(this.helper);
        }
    }

    onDispose() {
        if (this.helper) {
            this.helper.geometry.dispose();
            this.helper.material.dispose();
        }
    }
}

export default BoundingBoxHelper;
