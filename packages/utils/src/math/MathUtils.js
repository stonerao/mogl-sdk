/**
 * MathUtils 数学工具
 *
 * @description 数学计算相关的工具函数
 */
export class MathUtils {
    /**
     * 角度转弧度
     *
     * @param {number} degrees - 角度
     * @returns {number} 弧度
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * 弧度转角度
     *
     * @param {number} radians - 弧度
     * @returns {number} 角度
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * 限制数值范围
     *
     * @param {number} value - 值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 线性插值
     *
     * @param {number} start - 起始值
     * @param {number} end - 结束值
     * @param {number} t - 插值系数 (0-1)
     * @returns {number} 插值结果
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * 映射数值范围
     *
     * @param {number} value - 值
     * @param {number} inMin - 输入最小值
     * @param {number} inMax - 输入最大值
     * @param {number} outMin - 输出最小值
     * @param {number} outMax - 输出最大值
     * @returns {number} 映射后的值
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    /**
     * 随机数
     *
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机数
     */
    static random(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    }

    /**
     * 随机整数
     *
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机整数
     */
    static randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    }

    /**
     * 判断是否为2的幂
     *
     * @param {number} value - 值
     * @returns {boolean} 是否为2的幂
     */
    static isPowerOfTwo(value) {
        return (value & (value - 1)) === 0 && value !== 0;
    }

    /**
     * 向上取最接近的2的幂
     *
     * @param {number} value - 值
     * @returns {number} 2的幂
     */
    static ceilPowerOfTwo(value) {
        return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
    }

    /**
     * 向下取最接近的2的幂
     *
     * @param {number} value - 值
     * @returns {number} 2的幂
     */
    static floorPowerOfTwo(value) {
        return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
    }
}

export default MathUtils;
