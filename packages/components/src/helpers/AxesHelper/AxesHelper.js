import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * AxesHelper 坐标轴辅助组件
 *
 * @class AxesHelper
 * @extends Component
 */
export class AxesHelper extends Component {
    static defaultConfig = {
        size: 50
    };

    onMounted() {
        this.axes = new THREE.AxesHelper(this.config.size);
        this.add(this.axes);
    }

    onDispose() {
        if (this.axes) {
            this.axes.geometry.dispose();
            this.axes.material.dispose();
        }
    }
}

export default AxesHelper;
