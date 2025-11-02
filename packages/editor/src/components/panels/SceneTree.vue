<template>
    <div class="scene-tree">
        <!-- 工具栏 -->
        <div class="toolbar">
            <div class="text-xs font-medium text-gray-500">场景结构</div>
            <div class="flex gap-1">
                <button class="tool-btn" @click="expandAll" title="展开全部">
                    <span class="text-xs">📂</span>
                </button>
                <button class="tool-btn" @click="collapseAll" title="折叠全部">
                    <span class="text-xs">📁</span>
                </button>
                <button class="tool-btn" @click="clearAll" title="清空场景">
                    <span class="text-xs">🗑️</span>
                </button>
            </div>
        </div>

        <!-- 树形列表 -->
        <div class="tree-container">
            <div v-if="components.length === 0" class="empty-state">
                <div class="text-4xl mb-2">📦</div>
                <div class="text-sm text-gray-400">暂无组件</div>
                <div class="text-xs text-gray-400 mt-1">从左侧组件库添加组件</div>
            </div>

            <div v-else class="tree-list">
                <TreeNode
                    v-for="comp in components"
                    :key="comp.id"
                    :node="formatNodeData(comp)"
                    :selected="comp.id === selectedComponentId"
                    :expanded="expandedNodes.has(comp.id)"
                    @toggle="handleToggle(comp.id)"
                    @select="handleSelect(comp.id)"
                >
                    <template #actions>
                        <div class="node-actions">
                            <!-- 可见性切换 -->
                            <button
                                class="action-btn"
                                :class="{ active: comp.visible }"
                                @click.stop="handleToggleVisibility(comp.id)"
                                :title="comp.visible ? '隐藏' : '显示'"
                            >
                                {{ comp.visible ? '👁️' : '👁️‍🗨️' }}
                            </button>

                            <!-- 锁定切换 -->
                            <button
                                class="action-btn"
                                :class="{ active: comp.locked }"
                                @click.stop="handleToggleLock(comp.id)"
                                :title="comp.locked ? '解锁' : '锁定'"
                            >
                                {{ comp.locked ? '🔒' : '🔓' }}
                            </button>

                            <!-- 更多操作 -->
                            <button
                                class="action-btn"
                                @click.stop="handleShowMenu(comp.id, $event)"
                                title="更多操作"
                            >
                                ⋮
                            </button>
                        </div>
                    </template>
                </TreeNode>
            </div>
        </div>

        <!-- 右键菜单 -->
        <ContextMenu
            v-model:visible="contextMenu.visible"
            :x="contextMenu.x"
            :y="contextMenu.y"
            :items="contextMenuItems"
            @select="handleContextMenuSelect"
        />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import TreeNode from '@/components/ui/TreeNode.vue';
import ContextMenu from '@/components/ui/ContextMenu.vue';
import { useComponent } from '@/composables/useComponent';
import { useComponentStore } from '@/stores/useComponentStore';

const emit = defineEmits(['component-selected', 'component-deleted']);

// 使用组件管理
const componentStore = useComponentStore();
const { selectComponent, removeComponent, toggleComponentVisibility } = useComponent();

// 直接从 store 获取响应式数据
const components = computed(() => componentStore.components);
const selectedComponent = computed(() => componentStore.selectedComponent);
const selectedComponentId = computed(() => selectedComponent.value?.id || null);

// 展开的节点集合
const expandedNodes = ref(new Set());

// 右键菜单状态
const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    componentId: null
});

// 右键菜单项
const contextMenuItems = computed(() => {
    const componentList = components.value || [];
    const component = componentList.find((c) => c.id === contextMenu.value.componentId);
    if (!component) return [];

    return [
        {
            icon: '✏️',
            label: '重命名',
            action: 'rename'
        },
        {
            icon: component.visible ? '👁️‍🗨️' : '👁️',
            label: component.visible ? '隐藏' : '显示',
            action: 'toggleVisibility'
        },
        {
            icon: component.locked ? '🔓' : '🔒',
            label: component.locked ? '解锁' : '锁定',
            action: 'toggleLock'
        },
        {
            divider: true
        },
        {
            icon: '📋',
            label: '复制',
            action: 'duplicate',
            disabled: true // 暂未实现
        },
        {
            divider: true
        },
        {
            icon: '🗑️',
            label: '删除',
            action: 'delete',
            shortcut: 'Del'
        }
    ];
});

/**
 * 格式化节点数据
 */
const formatNodeData = (comp) => {
    return {
        id: comp.id,
        label: comp.name,
        icon: getComponentIcon(comp.type),
        children: [] // 暂不支持子节点
    };
};

/**
 * 获取组件图标
 */
const getComponentIcon = (type) => {
    const iconMap = {
        ModelLoader: '🎨',
        GridHelper: '📐',
        Light: '💡',
        Camera: '📷'
    };
    return iconMap[type] || '📦';
};

/**
 * 展开/折叠节点
 */
const handleToggle = (nodeId) => {
    if (expandedNodes.value.has(nodeId)) {
        expandedNodes.value.delete(nodeId);
    } else {
        expandedNodes.value.add(nodeId);
    }
};

/**
 * 选中节点
 */
const handleSelect = (componentId) => {
    selectComponent(componentId);
    emit('component-selected', componentId);
};

/**
 * 切换可见性
 */
const handleToggleVisibility = (componentId) => {
    toggleComponentVisibility(componentId);
};

/**
 * 切换锁定状态
 */
const handleToggleLock = (componentId) => {
    const componentList = components.value || [];
    const component = componentList.find((c) => c.id === componentId);
    if (component) {
        componentStore.updateComponent(componentId, {
            locked: !component.locked
        });
    }
};

/**
 * 显示右键菜单
 */
const handleShowMenu = (componentId, event) => {
    contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        componentId
    };

    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', hideContextMenu, { once: true });
    }, 0);
};

/**
 * 隐藏右键菜单
 */
const hideContextMenu = () => {
    contextMenu.value.visible = false;
};

/**
 * 处理右键菜单选择
 */
const handleContextMenuSelect = (item) => {
    const componentId = contextMenu.value.componentId;

    switch (item.action) {
        case 'rename':
            handleRename();
            break;
        case 'toggleVisibility':
            handleToggleVisibility(componentId);
            break;
        case 'toggleLock':
            handleToggleLock(componentId);
            break;
        case 'duplicate':
            handleDuplicate();
            break;
        case 'delete':
            handleDelete();
            break;
    }
};

/**
 * 重命名
 */
const handleRename = () => {
    const componentId = contextMenu.value.componentId;
    const componentList = components.value || [];
    const component = componentList.find((c) => c.id === componentId);
    if (component) {
        const newName = prompt('请输入新名称:', component.name);
        if (newName && newName.trim()) {
            componentStore.updateComponent(componentId, {
                name: newName.trim()
            });
        }
    }
};

/**
 * 复制
 */
const handleDuplicate = () => {
    const componentId = contextMenu.value.componentId;
    const componentList = components.value || [];
    const component = componentList.find((c) => c.id === componentId);
    if (component) {
        alert('复制功能将在后续版本实现');
    }
};

/**
 * 删除
 */
const handleDelete = () => {
    const componentId = contextMenu.value.componentId;
    if (confirm('确定要删除这个组件吗？')) {
        removeComponent(componentId);
        emit('component-deleted', componentId);
    }
};

/**
 * 展开全部
 */
const expandAll = () => {
    const componentList = components.value || [];
    componentList.forEach((comp) => {
        expandedNodes.value.add(comp.id);
    });
};

/**
 * 折叠全部
 */
const collapseAll = () => {
    expandedNodes.value.clear();
};

/**
 * 清空场景
 */
const clearAll = () => {
    if (confirm('确定要清空场景中的所有组件吗？')) {
        const { clearAllComponents } = useComponent();
        clearAllComponents();
    }
};
</script>

<style scoped>
.scene-tree {
    @apply h-full flex flex-col;
}

.toolbar {
    @apply flex items-center justify-between mb-3 pb-2 border-b border-gray-200;
}

.tool-btn {
    @apply p-1 rounded hover:bg-gray-100 transition-colors;
}

.tree-container {
    @apply flex-1 overflow-y-auto;
}

.empty-state {
    @apply flex flex-col items-center justify-center h-full text-center;
}

.tree-list {
    @apply space-y-1;
}

.node-actions {
    @apply flex items-center gap-1 opacity-0 transition-opacity;
}

.tree-node:hover .node-actions {
    @apply opacity-100;
}

.action-btn {
    @apply text-sm p-1 rounded hover:bg-gray-200 transition-colors;
    @apply opacity-50 hover:opacity-100;
}

.action-btn.active {
    @apply opacity-100;
}
</style>

