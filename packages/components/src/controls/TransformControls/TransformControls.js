import { Component } from '@w3d/core';

/**
 * TransformControls 变换控制组件
 *
 * @class TransformControls
 * @extends Component
 */
export class TransformControls extends Component {
    static defaultConfig = {
        mode: 'translate'
    };

    onMounted() {
        console.log('TransformControls mounted');
    }
}

export default TransformControls;
