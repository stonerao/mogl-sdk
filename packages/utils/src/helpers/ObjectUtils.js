/**
 * ObjectUtils 对象工具
 *
 * @description 对象操作相关的工具函数
 */
export class ObjectUtils {
    /**
     * 深度克隆
     *
     * @param {*} obj - 对象
     * @returns {*} 克隆后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map((item) => this.deepClone(item));

        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    /**
     * 深度合并
     *
     * @param {Object} target - 目标对象
     * @param {Object} source - 源对象
     * @returns {Object} 合并后的对象
     */
    static deepMerge(target, source) {
        const output = Object.assign({}, target);

        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
    }

    /**
     * 判断是否为对象
     *
     * @param {*} item - 项目
     * @returns {boolean} 是否为对象
     */
    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
}

export default ObjectUtils;
