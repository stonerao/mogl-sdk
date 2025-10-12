import { EventEmitter } from '@w3d/utils';
import { EventTypes } from '../event/EventTypes.js';

/**
 * ResourceManager 资源管理器
 *
 * @class ResourceManager
 * @description 资源加载、缓存和管理
 */
export class ResourceManager {
    /**
     * 创建资源管理器实例
     *
     * @param {Scene} scene - 场景实例
     */
    constructor(scene) {
        this.scene = scene;

        // 资源缓存
        this.cache = new Map();

        // 加载队列
        this.loadQueue = [];

        // 事件发射器
        this.eventEmitter = new EventEmitter();

        // 加载统计
        this.stats = {
            total: 0,
            loaded: 0,
            failed: 0
        };
    }

    /**
     * 加载资源
     *
     * @param {string} url - 资源 URL
     * @param {string} type - 资源类型
     * @param {Function} loader - 加载器函数
     * @returns {Promise} 加载结果
     */
    async load(url, type, loader) {
        // 检查缓存
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        // 触发加载开始事件
        this.eventEmitter.emit(EventTypes.RESOURCE_LOAD_START, { url, type });
        this.stats.total++;

        try {
            // 执行加载
            const resource = await loader(url, (progress) => {
                // 触发加载进度事件
                this.eventEmitter.emit(EventTypes.RESOURCE_LOAD_PROGRESS, {
                    url,
                    type,
                    progress
                });
            });

            // 缓存资源
            this.cache.set(url, resource);
            this.stats.loaded++;

            // 触发加载完成事件
            this.eventEmitter.emit(EventTypes.RESOURCE_LOAD_COMPLETE, {
                url,
                type,
                resource
            });

            return resource;
        } catch (error) {
            this.stats.failed++;

            // 触发加载错误事件
            this.eventEmitter.emit(EventTypes.RESOURCE_LOAD_ERROR, {
                url,
                type,
                error
            });

            throw error;
        }
    }

    /**
     * 获取缓存的资源
     *
     * @param {string} url - 资源 URL
     * @returns {*} 资源对象
     */
    get(url) {
        return this.cache.get(url);
    }

    /**
     * 移除缓存的资源
     *
     * @param {string} url - 资源 URL
     */
    remove(url) {
        this.cache.delete(url);
    }

    /**
     * 清空缓存
     */
    clear() {
        this.cache.clear();
        this.stats = {
            total: 0,
            loaded: 0,
            failed: 0
        };
    }

    /**
     * 获取加载统计
     *
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            progress: this.stats.total > 0 ? this.stats.loaded / this.stats.total : 0
        };
    }

    /**
     * 监听资源加载事件
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    on(event, handler) {
        this.eventEmitter.on(event, handler);
    }

    /**
     * 销毁资源管理器
     */
    dispose() {
        this.clear();
        this.eventEmitter.removeAllListeners();
    }
}
