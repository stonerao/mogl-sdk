/**
 * IndexedDBCache IndexedDB 缓存管理器
 *
 * @class IndexedDBCache
 * @description 使用 IndexedDB 持久化缓存模型和纹理资源
 */
export class IndexedDBCache {
    /**
     * 创建 IndexedDB 缓存管理器实例
     *
     * @param {Object} config - 配置选项
     * @param {boolean} config.enabled - 是否启用 IndexedDB 缓存
     * @param {string} config.dbName - 数据库名称
     * @param {string} config.storeName - 对象存储名称
     * @param {boolean} config.debug - 调试模式
     * @param {number} config.version - 数据库版本号
     */
    constructor(config = {}) {
        this.config = {
            enabled: true,
            dbName: 'W3DCache',
            storeName: 'resources',
            debug: false,
            version: 1,
            ...config
        };

        this.db = null;
        this.isInitialized = false;
        this.initPromise = null;
    }

    /**
     * 初始化 IndexedDB
     *
     * @returns {Promise<void>}
     */
    async init() {
        if (!this.config.enabled) {
            this.log('IndexedDB caching is disabled');
            return;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._initDB();
        return this.initPromise;
    }

    /**
     * 内部初始化数据库方法
     *
     * @private
     * @returns {Promise<void>}
     */
    async _initDB() {
        if (!window.indexedDB) {
            console.warn('IndexedDB is not supported in this browser');
            this.config.enabled = false;
            return;
        }

        try {
            // 检查版本号是否变化
            await this._checkVersionChange();

            // 打开数据库
            this.db = await this._openDatabase();
            this.isInitialized = true;
            this.log('IndexedDB initialized successfully');
        } catch (error) {
            console.error('Failed to initialize IndexedDB:', error);
            this.config.enabled = false;
        }
    }

    /**
     * 检查版本号变化并清空缓存
     *
     * @private
     * @returns {Promise<void>}
     */
    async _checkVersionChange() {
        const storedVersion = localStorage.getItem(`${this.config.dbName}_version`);
        const currentVersion = this.config.version.toString();

        if (storedVersion && storedVersion !== currentVersion) {
            this.log(`Version changed from ${storedVersion} to ${currentVersion}, clearing cache`);
            await this._clearDatabase();
        }

        // 保存当前版本号
        localStorage.setItem(`${this.config.dbName}_version`, currentVersion);
    }

    /**
     * 清空数据库
     *
     * @private
     * @returns {Promise<void>}
     */
    async _clearDatabase() {
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.config.dbName);

            deleteRequest.onsuccess = () => {
                this.log('Database cleared successfully');
                resolve();
            };

            deleteRequest.onerror = () => {
                reject(new Error('Failed to clear database'));
            };

            deleteRequest.onblocked = () => {
                this.log('Database deletion blocked');
            };
        });
    }

    /**
     * 打开数据库
     *
     * @private
     * @returns {Promise<IDBDatabase>}
     */
    _openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.config.dbName, 1);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建对象存储（如果不存在）
                if (!db.objectStoreNames.contains(this.config.storeName)) {
                    const objectStore = db.createObjectStore(this.config.storeName, {
                        keyPath: 'url'
                    });

                    // 创建索引
                    objectStore.createIndex('type', 'type', { unique: false });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });

                    this.log('Object store created');
                }
            };
        });
    }

    /**
     * 获取缓存的资源
     *
     * @param {string} url - 资源 URL
     * @returns {Promise<ArrayBuffer|null>} 资源数据
     */
    async get(url) {
        if (!this.config.enabled || !this.isInitialized) {
            return null;
        }

        try {
            const transaction = this.db.transaction([this.config.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.config.storeName);
            const request = objectStore.get(url);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        this.log(`Cache hit for: ${url}`);
                        resolve(result.data);
                    } else {
                        this.log(`Cache miss for: ${url}`);
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    reject(new Error('Failed to get resource from cache'));
                };
            });
        } catch (error) {
            console.error('Error getting resource from cache:', error);
            return null;
        }
    }

    /**
     * 存储资源到缓存
     *
     * @param {string} url - 资源 URL
     * @param {ArrayBuffer} data - 资源数据
     * @param {string} type - 资源类型 ('model' | 'texture')
     * @returns {Promise<void>}
     */
    async set(url, data, type = 'unknown') {
        if (!this.config.enabled || !this.isInitialized) {
            return;
        }

        try {
            const transaction = this.db.transaction([this.config.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.config.storeName);

            const record = {
                url,
                data,
                type,
                timestamp: Date.now(),
                version: this.config.version
            };

            const request = objectStore.put(record);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    this.log(`Cached ${type}: ${url}`);
                    resolve();
                };

                request.onerror = () => {
                    reject(new Error('Failed to cache resource'));
                };
            });
        } catch (error) {
            console.error('Error caching resource:', error);
        }
    }

    /**
     * 检查资源是否在缓存中
     *
     * @param {string} url - 资源 URL
     * @returns {Promise<boolean>}
     */
    async has(url) {
        if (!this.config.enabled || !this.isInitialized) {
            return false;
        }

        try {
            const data = await this.get(url);
            return data !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * 删除缓存的资源
     *
     * @param {string} url - 资源 URL
     * @returns {Promise<void>}
     */
    async delete(url) {
        if (!this.config.enabled || !this.isInitialized) {
            return;
        }

        try {
            const transaction = this.db.transaction([this.config.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.config.storeName);
            const request = objectStore.delete(url);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    this.log(`Deleted from cache: ${url}`);
                    resolve();
                };

                request.onerror = () => {
                    reject(new Error('Failed to delete resource from cache'));
                };
            });
        } catch (error) {
            console.error('Error deleting resource from cache:', error);
        }
    }

    /**
     * 清空所有缓存
     *
     * @returns {Promise<void>}
     */
    async clear() {
        if (!this.config.enabled || !this.isInitialized) {
            return;
        }

        try {
            const transaction = this.db.transaction([this.config.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.config.storeName);
            const request = objectStore.clear();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    this.log('All cache cleared');
                    resolve();
                };

                request.onerror = () => {
                    reject(new Error('Failed to clear cache'));
                };
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    /**
     * 获取缓存统计信息
     *
     * @returns {Promise<Object>}
     */
    async getStats() {
        if (!this.config.enabled || !this.isInitialized) {
            return { count: 0, size: 0 };
        }

        try {
            const transaction = this.db.transaction([this.config.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.config.storeName);
            const request = objectStore.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const items = request.result;
                    const count = items.length;
                    const size = items.reduce((total, item) => {
                        return total + (item.data ? item.data.byteLength : 0);
                    }, 0);

                    resolve({ count, size });
                };

                request.onerror = () => {
                    reject(new Error('Failed to get cache stats'));
                };
            });
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return { count: 0, size: 0 };
        }
    }

    /**
     * 调试日志
     *
     * @private
     * @param {string} message - 日志消息
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[IndexedDBCache] ${message}`);
        }
    }

    /**
     * 关闭数据库连接
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.isInitialized = false;
            this.log('Database connection closed');
        }
    }
}

