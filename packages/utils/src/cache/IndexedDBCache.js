/**
 * IndexedDBCache IndexedDB 缓存
 *
 * @class IndexedDBCache
 * @description 基于 IndexedDB 的缓存实现
 */
export class IndexedDBCache {
    constructor(dbName = 'W3DCache', storeName = 'resources') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    /**
     * 初始化数据库
     *
     * @returns {Promise} 初始化结果
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    /**
     * 设置缓存
     *
     * @param {string} key - 键
     * @param {*} value - 值
     * @returns {Promise} 设置结果
     */
    async set(key, value) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 获取缓存
     *
     * @param {string} key - 键
     * @returns {Promise<*>} 值
     */
    async get(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 删除缓存
     *
     * @param {string} key - 键
     * @returns {Promise} 删除结果
     */
    async delete(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export default IndexedDBCache;
