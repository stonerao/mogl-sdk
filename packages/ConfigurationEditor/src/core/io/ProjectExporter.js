/**
 * ProjectExporter.js
 * 工程导出功能
 *
 * 功能：
 * - 将工程数据导出为 JSON 文件
 * - 支持自定义文件名
 * - 支持导出选项（压缩、包含元数据等）
 */

import { ProjectSerializer } from '../serialization/ProjectSerializer.js';

/**
 * 工程导出器
 */
export class ProjectExporter {
    /**
     * 导出工程为 JSON 文件
     * @param {Object} options - 导出选项
     * @param {string} options.projectName - 工程名称
     * @param {Array} options.nodes - 节点列表
     * @param {Object} options.canvasConfig - 画布配置
     * @param {Object} options.metadata - 元数据
     * @param {Array} options.dataSources - 数据源列表
     * @param {Map} options.bindings - 数据绑定映射
     * @param {string} options.fileName - 文件名（可选）
     * @param {boolean} options.prettify - 是否格式化 JSON（默认 true）
     * @param {boolean} options.includeMetadata - 是否包含元数据（默认 true）
     */
    static export(options = {}) {
        const {
            projectName = '未命名工程',
            nodes = [],
            canvasConfig = {},
            metadata = {},
            dataSources = [],
            bindings = new Map(),
            events = [],
            globalEvents = null,
            fileName = null,
            prettify = true,
            includeMetadata = true
        } = options;

        try {
            // 序列化工程数据
            const projectData = ProjectSerializer.serialize({
                projectName,
                nodes,
                canvasConfig,
                metadata: includeMetadata ? metadata : {},
                dataSources,
                bindings,
                events,
                globalEvents
            });

            // 验证数据
            const validation = ProjectSerializer.validate(projectData);
            if (!validation.valid) {
                throw new Error(`工程数据验证失败: ${validation.errors.join(', ')}`);
            }

            // 转换为 JSON 字符串
            const jsonString = prettify
                ? JSON.stringify(projectData, null, 2)
                : JSON.stringify(projectData);

            // 生成文件名
            const finalFileName = fileName || this.generateFileName(projectName);

            // 下载文件
            this.downloadFile(jsonString, finalFileName);

            return {
                success: true,
                fileName: finalFileName,
                size: jsonString.length
            };
        } catch (error) {
            console.error('导出工程失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 生成文件名
     * @param {string} projectName - 工程名称
     * @returns {string} 文件名
     */
    static generateFileName(projectName) {
        // 清理文件名（移除非法字符）
        const cleanName = projectName.replace(/[<>:"/\\|?*]/g, '_');

        // 生成时间戳
        const timestamp = new Date().toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '')
            .replace('T', '_');

        return `${cleanName}_${timestamp}.json`;
    }

    /**
     * 下载文件到本地
     * @param {string} content - 文件内容
     * @param {string} fileName - 文件名
     */
    static downloadFile(content, fileName) {
        // 创建 Blob 对象
        const blob = new Blob([content], { type: 'application/json' });

        // 创建下载链接
        const url = URL.createObjectURL(blob);

        // 创建临时 <a> 元素
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        // 触发下载
        document.body.appendChild(link);
        link.click();

        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 导出为 JSON 字符串（不下载）
     * @param {Object} options - 导出选项
     * @returns {string} JSON 字符串
     */
    static exportToString(options = {}) {
        const {
            projectName = '未命名工程',
            nodes = [],
            canvasConfig = {},
            metadata = {},
            prettify = true
        } = options;

        const projectData = ProjectSerializer.serialize({
            projectName,
            nodes,
            canvasConfig,
            metadata
        });

        return prettify
            ? JSON.stringify(projectData, null, 2)
            : JSON.stringify(projectData);
    }

    /**
     * 复制 JSON 到剪贴板
     * @param {Object} options - 导出选项
     * @returns {Promise<boolean>} 是否成功
     */
    static async copyToClipboard(options = {}) {
        try {
            const jsonString = this.exportToString(options);
            await navigator.clipboard.writeText(jsonString);
            return true;
        } catch (error) {
            console.error('复制到剪贴板失败:', error);
            return false;
        }
    }

    /**
     * 获取导出数据的统计信息
     * @param {Object} options - 导出选项
     * @returns {Object} 统计信息
     */
    static getExportStats(options = {}) {
        const jsonString = this.exportToString(options);
        const projectData = JSON.parse(jsonString);

        // 递归计算节点数量
        const countNodes = (nodes) => {
            let count = 0;
            nodes.forEach(node => {
                count++;
                if (node.children && node.children.length > 0) {
                    count += countNodes(node.children);
                }
            });
            return count;
        };

        return {
            totalNodes: countNodes(projectData.nodes || []),
            rootNodes: (projectData.nodes || []).length,
            fileSize: jsonString.length,
            fileSizeKB: (jsonString.length / 1024).toFixed(2),
            version: projectData.version,
            projectName: projectData.metadata?.name || '未命名工程'
        };
    }
}

