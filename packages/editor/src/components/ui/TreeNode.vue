<template>
    <div class="tree-node group">
        <div
            class="tree-node-content"
            :class="{ selected: selected, 'has-children': hasChildren }"
            :style="{ paddingLeft: `${level * 16}px` }"
            @click="handleClick"
        >
            <!-- 展开/折叠图标 -->
            <span v-if="hasChildren" class="tree-node-icon" @click.stop="handleToggle">
                {{ expanded ? '▼' : '▶' }}
            </span>
            <span v-else class="tree-node-icon-placeholder"></span>

            <!-- 节点图标 -->
            <span class="tree-node-type-icon">{{ icon }}</span>

            <!-- 节点标签 -->
            <span class="tree-node-label">{{ label }}</span>

            <!-- 自定义操作插槽 -->
            <slot name="actions"></slot>
        </div>

        <!-- 子节点 -->
        <div v-if="hasChildren && expanded" class="tree-node-children">
            <TreeNode
                v-for="child in children"
                :key="child.id"
                :node="child"
                :level="level + 1"
                :selected="selectedId === child.id"
                :expanded="expandedNodes.has(child.id)"
                @select="handleChildSelect"
                @toggle="handleChildToggle"
            >
                <template #actions>
                    <slot name="actions" :node="child"></slot>
                </template>
            </TreeNode>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    level: {
        type: Number,
        default: 0
    },
    selected: {
        type: Boolean,
        default: false
    },
    expanded: {
        type: Boolean,
        default: false
    },
    selectedId: {
        type: String,
        default: null
    },
    expandedNodes: {
        type: Set,
        default: () => new Set()
    }
});

const emit = defineEmits(['select', 'toggle']);

const hasChildren = computed(() => {
    return props.node.children && props.node.children.length > 0;
});

const label = computed(() => props.node.label || props.node.name || 'Unnamed');
const icon = computed(() => props.node.icon || '📦');
const children = computed(() => props.node.children || []);

const handleToggle = () => {
    emit('toggle', props.node.id);
};

const handleClick = () => {
    emit('select', props.node.id);
};

const handleChildSelect = (id) => {
    emit('select', id);
};

const handleChildToggle = (id) => {
    emit('toggle', id);
};
</script>

<style scoped>
.tree-node {
    @apply select-none;
}

.tree-node-content {
    @apply flex items-center gap-1 px-2 py-1.5 text-sm;
    @apply hover:bg-gray-100 cursor-pointer transition-colors;
}

.tree-node-content.selected {
    @apply bg-primary-50 text-primary-700;
}

.tree-node-icon {
    @apply text-xs text-gray-500 w-4 flex items-center justify-center;
}

.tree-node-icon-placeholder {
    @apply w-4;
}

.tree-node-type-icon {
    @apply text-base;
}

.tree-node-label {
    @apply flex-1 truncate;
}

.tree-node-visibility {
    @apply text-sm opacity-50 hover:opacity-100 transition-opacity;
}

.tree-node-children {
    @apply ml-0;
}
</style>

