/**
 * project.js
 * 工程状态管理 Store
 * 
 * 功能：
 * - 管理工程元数据（名称、版本、创建时间等）
 * - 跟踪工程的修改状态（脏标记）
 * - 提供工程相关的操作方法
 */

import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
    state: () => ({
        // 工程元数据
        metadata: {
            name: '未命名工程',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            author: 'Unknown',
            description: ''
        },

        // 修改状态（脏标记）
        isDirty: false,

        // 最后保存时间
        lastSavedAt: null,

        // 自动保存配置
        autoSave: {
            enabled: false,
            interval: 60000, // 60秒
            lastAutoSaveAt: null
        }
    }),

    getters: {
        /**
         * 获取工程显示名称（带修改标记）
         */
        displayName: (state) => {
            return state.isDirty ? `${state.metadata.name} *` : state.metadata.name;
        },

        /**
         * 检查是否有未保存的更改
         */
        hasUnsavedChanges: (state) => {
            return state.isDirty;
        },

        /**
         * 获取工程信息摘要
         */
        projectInfo: (state) => {
            return {
                name: state.metadata.name,
                version: state.metadata.version,
                createdAt: state.metadata.createdAt,
                modifiedAt: state.metadata.modifiedAt,
                author: state.metadata.author,
                description: state.metadata.description,
                isDirty: state.isDirty,
                lastSavedAt: state.lastSavedAt
            };
        }
    },

    actions: {
        /**
         * 设置工程元数据
         * @param {Object} metadata - 元数据对象
         */
        setMetadata(metadata) {
            this.metadata = {
                ...this.metadata,
                ...metadata,
                modifiedAt: new Date().toISOString()
            };
        },

        /**
         * 更新工程名称
         * @param {string} name - 新名称
         */
        setProjectName(name) {
            this.metadata.name = name;
            this.metadata.modifiedAt = new Date().toISOString();
            this.markAsDirty();
        },

        /**
         * 标记为已修改
         */
        markAsDirty() {
            this.isDirty = true;
            this.metadata.modifiedAt = new Date().toISOString();
        },

        /**
         * 标记为已保存
         */
        markAsSaved() {
            this.isDirty = false;
            this.lastSavedAt = new Date().toISOString();
        },

        /**
         * 重置工程状态（新建工程）
         */
        reset() {
            this.metadata = {
                name: '未命名工程',
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                author: 'Unknown',
                description: ''
            };
            this.isDirty = false;
            this.lastSavedAt = null;
        },

        /**
         * 从序列化数据加载工程元数据
         * @param {Object} metadata - 序列化的元数据
         */
        loadMetadata(metadata) {
            this.metadata = {
                ...this.metadata,
                ...metadata
            };
            this.isDirty = false;
            this.lastSavedAt = new Date().toISOString();
        },

        /**
         * 启用自动保存
         * @param {number} interval - 自动保存间隔（毫秒）
         */
        enableAutoSave(interval = 60000) {
            this.autoSave.enabled = true;
            this.autoSave.interval = interval;
        },

        /**
         * 禁用自动保存
         */
        disableAutoSave() {
            this.autoSave.enabled = false;
        },

        /**
         * 更新自动保存时间
         */
        updateAutoSaveTime() {
            this.autoSave.lastAutoSaveAt = new Date().toISOString();
        }
    }
});

