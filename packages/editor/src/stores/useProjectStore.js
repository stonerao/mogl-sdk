import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSceneStore } from './useSceneStore';
import { useComponentStore } from './useComponentStore';
import { useToast } from '@/composables/useToast';

/**
 * 项目 Store
 * 管理项目保存/加载/导出功能
 */
export const useProjectStore = defineStore('project', () => {
    // ==================== 状态 ====================

    // 项目名称
    const projectName = ref('未命名项目');

    // 项目版本
    const projectVersion = ref('1.0.0');

    // 项目最后保存时间
    const lastSavedAt = ref(null);

    // 是否有未保存的更改
    const hasUnsavedChanges = ref(false);

    // 自动保存开关
    const autoSaveEnabled = ref(true);

    // 自动保存间隔（毫秒）
    const autoSaveInterval = ref(60000); // 1分钟

    // ==================== 计算属性 ====================

    // 项目信息
    const projectInfo = computed(() => ({
        name: projectName.value,
        version: projectVersion.value,
        lastSavedAt: lastSavedAt.value,
        hasUnsavedChanges: hasUnsavedChanges.value
    }));

    // ==================== 方法 ====================

    /**
     * 序列化项目数据
     * @returns {Object} 项目数据对象
     */
    const serializeProject = () => {
        const sceneStore = useSceneStore();
        const componentStore = useComponentStore();

        const projectData = {
            version: projectVersion.value,
            name: projectName.value,
            savedAt: new Date().toISOString(),

            // 场景配置
            scene: {
                renderer: { ...sceneStore.sceneConfig.renderer },
                camera: { ...sceneStore.sceneConfig.camera },
                lighting: { ...sceneStore.sceneConfig.lighting },
                background: { ...sceneStore.sceneConfig.background },
                helpers: { ...sceneStore.sceneConfig.helpers }
            },

            // 组件列表
            components: componentStore.components.map((component) => ({
                id: component.id,
                name: component.name,
                type: component.type,
                config: { ...component.config },
                visible: component.visible,
                locked: component.locked,
                events: component.events ? component.events.map((event) => ({
                    id: event.id,
                    type: event.type,
                    enabled: event.enabled,
                    handler: event.handler,
                    createdAt: event.createdAt
                })) : [],
                createdAt: component.createdAt
            }))
        };

        return projectData;
    };

    /**
     * 反序列化项目数据
     * @param {Object} projectData - 项目数据对象
     */
    const deserializeProject = async (projectData) => {
        const sceneStore = useSceneStore();
        const componentStore = useComponentStore();

        try {
            // 更新项目信息
            projectName.value = projectData.name || '未命名项目';
            projectVersion.value = projectData.version || '1.0.0';

            // 恢复场景配置
            if (projectData.scene) {
                // 更新场景配置
                sceneStore.sceneConfig = {
                    renderer: { ...sceneStore.sceneConfig.renderer, ...projectData.scene.renderer },
                    camera: { ...sceneStore.sceneConfig.camera, ...projectData.scene.camera },
                    lighting: { ...sceneStore.sceneConfig.lighting, ...projectData.scene.lighting },
                    background: { ...sceneStore.sceneConfig.background, ...projectData.scene.background },
                    helpers: { ...sceneStore.sceneConfig.helpers, ...projectData.scene.helpers }
                };

                // 应用场景配置
                await sceneStore.updateRenderer(projectData.scene.renderer);
                await sceneStore.updateCamera(projectData.scene.camera);
                await sceneStore.updateLighting(projectData.scene.lighting);
                await sceneStore.updateBackground(projectData.scene.background);
                await sceneStore.updateHelpers(projectData.scene.helpers);
            }

            // 清空现有组件
            componentStore.components = [];

            // 恢复组件（注意：这里只恢复数据，不创建场景实例）
            // 实际的场景实例需要通过 useComponent.addComponent 重新创建
            if (projectData.components && Array.isArray(projectData.components)) {
                for (const componentData of projectData.components) {
                    componentStore.components.push({
                        id: componentData.id,
                        name: componentData.name,
                        type: componentData.type,
                        config: { ...componentData.config },
                        instance: null, // 需要重新创建
                        visible: componentData.visible !== undefined ? componentData.visible : true,
                        locked: componentData.locked || false,
                        events: componentData.events || [],
                        createdAt: componentData.createdAt || Date.now()
                    });
                }
            }

            console.log('[Project] Project loaded successfully');
        } catch (error) {
            console.error('[Project] Failed to deserialize project:', error);
            throw error;
        }
    };

    /**
     * 保存项目到本地存储
     */
    const saveToLocalStorage = () => {
        const toast = useToast();
        try {
            const projectData = serializeProject();
            const jsonString = JSON.stringify(projectData, null, 2);

            localStorage.setItem('w3d_editor_project', jsonString);
            localStorage.setItem('w3d_editor_project_name', projectName.value);

            lastSavedAt.value = new Date().toISOString();
            hasUnsavedChanges.value = false;

            console.log('[Project] Project saved to localStorage');
            toast.success('项目已保存到本地');
            return true;
        } catch (error) {
            console.error('[Project] Failed to save to localStorage:', error);
            toast.error(`保存失败: ${error.message}`);
            return false;
        }
    };

    /**
     * 从本地存储加载项目
     */
    const loadFromLocalStorage = async () => {
        const toast = useToast();
        try {
            const jsonString = localStorage.getItem('w3d_editor_project');
            if (!jsonString) {
                console.log('[Project] No saved project found in localStorage');
                toast.warning('未找到已保存的项目');
                return false;
            }

            const projectData = JSON.parse(jsonString);
            await deserializeProject(projectData);

            lastSavedAt.value = projectData.savedAt || null;
            hasUnsavedChanges.value = false;

            console.log('[Project] Project loaded from localStorage');
            toast.success('项目已加载');
            return true;
        } catch (error) {
            console.error('[Project] Failed to load from localStorage:', error);
            toast.error(`加载失败: ${error.message}`);
            return false;
        }
    };

    /**
     * 导出项目为 JSON 文件
     */
    const exportToJSON = () => {
        try {
            const projectData = serializeProject();
            const jsonString = JSON.stringify(projectData, null, 2);

            // 创建 Blob
            const blob = new Blob([jsonString], { type: 'application/json' });

            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${projectName.value}_${Date.now()}.json`;

            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 释放 URL
            URL.revokeObjectURL(url);

            console.log('[Project] Project exported to JSON file');
            return true;
        } catch (error) {
            console.error('[Project] Failed to export to JSON:', error);
            return false;
        }
    };

    /**
     * 从 JSON 文件导入项目
     * @param {File} file - JSON 文件
     */
    const importFromJSON = async (file) => {
        try {
            const text = await file.text();
            const projectData = JSON.parse(text);

            await deserializeProject(projectData);

            hasUnsavedChanges.value = true; // 导入后标记为未保存

            console.log('[Project] Project imported from JSON file');
            return true;
        } catch (error) {
            console.error('[Project] Failed to import from JSON:', error);
            throw error;
        }
    };

    /**
     * 清空本地存储的项目
     */
    const clearLocalStorage = () => {
        try {
            localStorage.removeItem('w3d_editor_project');
            localStorage.removeItem('w3d_editor_project_name');
            console.log('[Project] LocalStorage cleared');
            return true;
        } catch (error) {
            console.error('[Project] Failed to clear localStorage:', error);
            return false;
        }
    };

    /**
     * 标记有未保存的更改
     */
    const markAsUnsaved = () => {
        hasUnsavedChanges.value = true;
    };

    // ==================== 返回 ====================

    return {
        // 状态
        projectName,
        projectVersion,
        lastSavedAt,
        hasUnsavedChanges,
        autoSaveEnabled,
        autoSaveInterval,

        // 计算属性
        projectInfo,

        // 方法
        serializeProject,
        deserializeProject,
        saveToLocalStorage,
        loadFromLocalStorage,
        exportToJSON,
        importFromJSON,
        clearLocalStorage,
        markAsUnsaved
    };
});

