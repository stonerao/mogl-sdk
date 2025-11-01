/**
 * ProjectImporter.js
 * 工程导入功能
 * 
 * 功能：
 * - 从 JSON 文件导入工程数据
 * - 验证数据格式和版本兼容性
 * - 恢复节点、分组、属性等所有数据
 */

import { ProjectSerializer } from '../serialization/ProjectSerializer.js';

/**
 * 工程导入器
 */
export class ProjectImporter {
    /**
     * 从文件导入工程
     * @param {File} file - 文件对象
     * @param {Object} scene - Three.js 场景对象
     * @returns {Promise<Object>} 导入结果
     */
    static async importFromFile(file, scene) {
        try {
            // 检查文件类型
            if (!file.name.endsWith('.json')) {
                throw new Error('只支持 .json 格式的文件');
            }

            // 读取文件内容
            const content = await this.readFile(file);

            // 解析 JSON
            let projectData;
            try {
                projectData = JSON.parse(content);
            } catch (error) {
                throw new Error('JSON 格式错误: ' + error.message);
            }

            // 验证数据
            const validation = ProjectSerializer.validate(projectData);
            if (!validation.valid) {
                throw new Error(`工程数据验证失败:\n${validation.errors.join('\n')}`);
            }

            // 反序列化
            const result = ProjectSerializer.deserialize(projectData, scene);

            return {
                success: true,
                data: result,
                fileName: file.name,
                fileSize: file.size
            };
        } catch (error) {
            console.error('导入工程失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 从 JSON 字符串导入工程
     * @param {string} jsonString - JSON 字符串
     * @param {Object} scene - Three.js 场景对象
     * @returns {Object} 导入结果
     */
    static importFromString(jsonString, scene) {
        try {
            // 解析 JSON
            const projectData = JSON.parse(jsonString);

            // 验证数据
            const validation = ProjectSerializer.validate(projectData);
            if (!validation.valid) {
                throw new Error(`工程数据验证失败:\n${validation.errors.join('\n')}`);
            }

            // 反序列化
            const result = ProjectSerializer.deserialize(projectData, scene);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('导入工程失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 读取文件内容
     * @param {File} file - 文件对象
     * @returns {Promise<string>} 文件内容
     */
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = (error) => {
                reject(new Error('读取文件失败: ' + error.message));
            };

            reader.readAsText(file);
        });
    }

    /**
     * 打开文件选择对话框
     * @returns {Promise<File>} 选择的文件
     */
    static selectFile() {
        return new Promise((resolve, reject) => {
            // 创建文件输入元素
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('未选择文件'));
                }
            };

            input.oncancel = () => {
                reject(new Error('取消选择文件'));
            };

            // 触发文件选择
            input.click();
        });
    }

    /**
     * 导入工程（包含文件选择）
     * @param {Object} scene - Three.js 场景对象
     * @returns {Promise<Object>} 导入结果
     */
    static async import(scene) {
        try {
            // 选择文件
            const file = await this.selectFile();

            // 导入文件
            const result = await this.importFromFile(file, scene);

            return result;
        } catch (error) {
            console.error('导入工程失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 验证工程文件
     * @param {File} file - 文件对象
     * @returns {Promise<Object>} 验证结果
     */
    static async validateFile(file) {
        try {
            // 读取文件
            const content = await this.readFile(file);

            // 解析 JSON
            const projectData = JSON.parse(content);

            // 验证数据
            const validation = ProjectSerializer.validate(projectData);

            return {
                valid: validation.valid,
                errors: validation.errors,
                metadata: projectData.metadata,
                version: projectData.version,
                nodeCount: this.countNodes(projectData.nodes || [])
            };
        } catch (error) {
            return {
                valid: false,
                errors: [error.message]
            };
        }
    }

    /**
     * 递归计算节点数量
     * @param {Array} nodes - 节点列表
     * @returns {number} 节点总数
     */
    static countNodes(nodes) {
        let count = 0;
        nodes.forEach(node => {
            count++;
            if (node.children && node.children.length > 0) {
                count += this.countNodes(node.children);
            }
        });
        return count;
    }

    /**
     * 获取工程文件信息
     * @param {File} file - 文件对象
     * @returns {Promise<Object>} 文件信息
     */
    static async getFileInfo(file) {
        try {
            const validation = await this.validateFile(file);

            return {
                fileName: file.name,
                fileSize: file.size,
                fileSizeKB: (file.size / 1024).toFixed(2),
                lastModified: new Date(file.lastModified).toISOString(),
                ...validation
            };
        } catch (error) {
            return {
                fileName: file.name,
                error: error.message
            };
        }
    }
}

