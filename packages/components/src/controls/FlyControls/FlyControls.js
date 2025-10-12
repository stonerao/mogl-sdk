import { Component } from '@w3d/core';

/**
 * FlyControls 飞行控制组件
 *
 * @class FlyControls
 * @extends Component
 */
export class FlyControls extends Component {
    static defaultConfig = {
        moveSpeed: 10
    };

    onMounted() {
        console.log('FlyControls mounted');
    }
}

export default FlyControls;
