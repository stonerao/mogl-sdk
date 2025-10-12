/**
 * MemoryCache 内存缓存
 *
 * @class MemoryCache
 * @description 基于内存的缓存实现
 */
export class MemoryCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    /**
     * 设置缓存
     *
     * @param {string} key - 键
     * @param {*} value - 值
     */
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    /**
     * 获取缓存
     *
     * @param {string} key - 键
     * @returns {*} 值
     */
    get(key) {
        const item = this.cache.get(key);
        return item ? item.value : null;
    }

    /**
     * 检查是否存在
     *
     * @param {string} key - 键
     * @returns {boolean} 是否存在
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * 删除缓存
     *
     * @param {string} key - 键
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * 清空缓存
     */
    clear() {
        this.cache.clear();
    }
}

export default MemoryCache;
