<template>
    <div class="accordion-container">
        <div
            v-for="item in items"
            :key="item.key"
            class="accordion-item"
        >
            <button
                class="accordion-header"
                :class="{ expanded: isExpanded(item.key) }"
                @click="toggle(item.key)"
            >
                <span class="accordion-title">
                    <!-- <span v-if="item.icon" class="accordion-item-icon">{{ item.icon }}</span> -->
                    {{ item.label }}
                </span>
                <span class="accordion-icon">{{ isExpanded(item.key) ? '▼' : '▶' }}</span>
            </button>
            <div v-show="isExpanded(item.key)" class="accordion-content">
                <slot :name="item.key"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    items: {
        type: Array,
        required: true,
        // items: [{ key: 'transform', label: '变换', icon: '📐' }]
    },
    defaultOpen: {
        type: Array,
        default: () => []
        // defaultOpen: ['transform', 'properties']
    }
});

// 展开状态管理
const expandedKeys = ref(new Set(props.defaultOpen));

// 检查是否展开
const isExpanded = (key) => {
    return expandedKeys.value.has(key);
};

// 切换展开状态
const toggle = (key) => {
    if (expandedKeys.value.has(key)) {
        expandedKeys.value.delete(key);
    } else {
        expandedKeys.value.add(key);
    }
    // 触发响应式更新
    expandedKeys.value = new Set(expandedKeys.value);
};
</script>

<style scoped>
.accordion-container {
    @apply space-y-2;
}

.accordion-item {
    @apply border border-gray-200 rounded overflow-hidden;
}

.accordion-header {
    @apply w-full flex items-center justify-between px-4 py-3;
    @apply bg-gray-50 hover:bg-gray-100 transition-colors;
    @apply text-left font-medium text-sm text-gray-700;
}

.accordion-header.expanded {
    @apply bg-gray-100;
}

.accordion-title {
    @apply flex-1 flex items-center gap-2;
}

.accordion-item-icon {
    @apply text-base;
}

.accordion-icon {
    @apply text-gray-500 text-xs;
}

.accordion-content {
    @apply p-2 bg-white border-t border-gray-200;
}
</style>

