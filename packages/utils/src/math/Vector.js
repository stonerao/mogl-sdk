/**
 * Vector 向量工具
 *
 * @description 向量计算相关的工具函数
 */
export class Vector {
    /**
     * 计算两点距离
     *
     * @param {Object} p1 - 点1 {x, y, z}
     * @param {Object} p2 - 点2 {x, y, z}
     * @returns {number} 距离
     */
    static distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = (p2.z || 0) - (p1.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * 向量归一化
     *
     * @param {Object} v - 向量 {x, y, z}
     * @returns {Object} 归一化后的向量
     */
    static normalize(v) {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + (v.z || 0) * (v.z || 0));
        return {
            x: v.x / length,
            y: v.y / length,
            z: (v.z || 0) / length
        };
    }

    /**
     * 向量点积
     *
     * @param {Object} v1 - 向量1
     * @param {Object} v2 - 向量2
     * @returns {number} 点积
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + (v1.z || 0) * (v2.z || 0);
    }

    /**
     * 向量叉积
     *
     * @param {Object} v1 - 向量1
     * @param {Object} v2 - 向量2
     * @returns {Object} 叉积向量
     */
    static cross(v1, v2) {
        return {
            x: v1.y * (v2.z || 0) - (v1.z || 0) * v2.y,
            y: (v1.z || 0) * v2.x - v1.x * (v2.z || 0),
            z: v1.x * v2.y - v1.y * v2.x
        };
    }
}

export default Vector;
