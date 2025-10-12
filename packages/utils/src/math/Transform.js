/**
 * Transform 变换工具
 *
 * @description 坐标变换相关的工具函数
 */
export class Transform {
    /**
     * 创建变换矩阵
     *
     * @param {Object} position - 位置 {x, y, z}
     * @param {Object} rotation - 旋转 {x, y, z}
     * @param {Object} scale - 缩放 {x, y, z}
     * @returns {Array} 变换矩阵
     */
    static createMatrix(position, rotation, scale) {
        // 简化实现，实际应使用完整的矩阵计算
        return {
            position: position || { x: 0, y: 0, z: 0 },
            rotation: rotation || { x: 0, y: 0, z: 0 },
            scale: scale || { x: 1, y: 1, z: 1 }
        };
    }

    /**
     * 应用变换
     *
     * @param {Object} point - 点 {x, y, z}
     * @param {Object} transform - 变换
     * @returns {Object} 变换后的点
     */
    static apply(point, transform) {
        // 简化实现
        return {
            x: point.x * transform.scale.x + transform.position.x,
            y: point.y * transform.scale.y + transform.position.y,
            z: point.z * transform.scale.z + transform.position.z
        };
    }
}

export default Transform;
