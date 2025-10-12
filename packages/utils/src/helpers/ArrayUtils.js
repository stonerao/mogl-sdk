/**
 * ArrayUtils 数组工具
 *
 * @description 数组操作相关的工具函数
 */
export class ArrayUtils {
    /**
     * 数组去重
     *
     * @param {Array} arr - 数组
     * @returns {Array} 去重后的数组
     */
    static unique(arr) {
        return [...new Set(arr)];
    }

    /**
     * 数组扁平化
     *
     * @param {Array} arr - 数组
     * @param {number} depth - 深度
     * @returns {Array} 扁平化后的数组
     */
    static flatten(arr, depth = 1) {
        return depth > 0
            ? arr.reduce(
                  (acc, val) => acc.concat(Array.isArray(val) ? this.flatten(val, depth - 1) : val),
                  []
              )
            : arr.slice();
    }

    /**
     * 数组分块
     *
     * @param {Array} arr - 数组
     * @param {number} size - 块大小
     * @returns {Array} 分块后的数组
     */
    static chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * 随机打乱数组
     *
     * @param {Array} arr - 数组
     * @returns {Array} 打乱后的数组
     */
    static shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

export default ArrayUtils;
