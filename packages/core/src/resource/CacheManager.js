/**
 * CacheManager 缓存管理器
 *
 * @class CacheManager
 * @description 资源缓存管理
 */
export class CacheManager {
    /**
     * 创建缓存管理器实例
     */
    constructor() {
        // 缓存存储
        this.cache = new Map();

        // 缓存大小限制（MB）
        this.maxSize = 100;

        // 当前缓存大小
        this.currentSize = 0;
    }

    /**
     * 设置缓存
     *
     * @param {string} key - 缓存键
     * @param {*} value - 缓存值
     * @param {number} size - 大小（字节）
     */
    set(key, value, size = 0) {
        // 检查缓存大小
        if (this.currentSize + size > this.maxSize * 1024 * 1024) {
            this.evict();
        }

        this.cache.set(key, {
            value,
            size,
            timestamp: Date.now()
        });

        this.currentSize += size;
    }

    /**
     * 获取缓存
     *
     * @param {string} key - 缓存键
     * @returns {*} 缓存值
     */
    get(key) {
        const item = this.cache.get(key);

        if (item) {
            // 更新访问时间
            item.timestamp = Date.now();
            return item.value;
        }

        return null;
    }

    /**
     * 检查缓存是否存在
     *
     * @param {string} key - 缓存键
     * @returns {boolean} 是否存在
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * 删除缓存
     *
     * @param {string} key - 缓存键
     */
    delete(key) {
        const item = this.cache.get(key);

        if (item) {
            this.currentSize -= item.size;
            this.cache.delete(key);
        }
    }

    /**
     * 清空缓存
     */
    clear() {
        this.cache.clear();
        this.currentSize = 0;
    }

    /**
     * 驱逐缓存（LRU 策略）
     */
    evict() {
        // 找到最旧的缓存项
        let oldestKey = null;
        let oldestTime = Infinity;

        this.cache.forEach((item, key) => {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        });

        // 删除最旧的缓存项
        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    /**
     * 获取缓存统计
     *
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            count: this.cache.size,
            size: this.currentSize,
            maxSize: this.maxSize * 1024 * 1024,
            usage: this.currentSize / (this.maxSize * 1024 * 1024)
        };
    }
}
