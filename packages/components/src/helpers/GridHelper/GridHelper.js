import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * GridHelper 网格辅助组件
 *
 * @class GridHelper
 * @extends Component
 */
export class GridHelper extends Component {
    static defaultConfig = {
        size: 100,
        divisions: 10,
        colorCenterLine: '#444444',
        colorGrid: '#888888'
    };

    onMounted() {
        this.grid = new THREE.GridHelper(
            this.config.size,
            this.config.divisions,
            this.config.colorCenterLine,
            this.config.colorGrid
        );

        this.add(this.grid);
    }

    onDispose() {
        if (this.grid) {
            this.grid.geometry.dispose();
            this.grid.material.dispose();
        }
    }
}

export default GridHelper;
