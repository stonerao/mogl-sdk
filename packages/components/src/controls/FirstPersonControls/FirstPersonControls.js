import { Component } from '@w3d/core';

/**
 * FirstPersonControls 第一人称控制组件
 *
 * @class FirstPersonControls
 * @extends Component
 */
export class FirstPersonControls extends Component {
    static defaultConfig = {
        moveSpeed: 10,
        lookSpeed: 0.1
    };

    onMounted() {
        // 第一人称控制实现占位
        console.log('FirstPersonControls mounted');
    }
}

export default FirstPersonControls;
