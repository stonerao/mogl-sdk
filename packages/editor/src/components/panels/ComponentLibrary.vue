<template>
    <div class="component-library">
        <!-- 搜索框 -->
        <div class="mb-3">
            <Input
                v-model="searchKeyword"
                placeholder="搜索组件..."
                size="sm"
                @input="handleSearch"
            />
        </div>

        <!-- 分类过滤 -->
        <div class="mb-3">
            <div class="flex gap-2 flex-wrap">
                <button
                    v-for="cat in categories"
                    :key="cat.key"
                    class="category-btn"
                    :class="{ active: selectedCategory === cat.key }"
                    @click="selectedCategory = cat.key"
                >
                    {{ cat.label }}
                </button>
            </div>
        </div>

        <!-- 组件列表 -->
        <div class="component-list">
            <div v-if="filteredComponents.length === 0" class="empty-state">
                <div class="text-gray-400 text-sm">暂无组件</div>
            </div>

            <div
                v-for="comp in filteredComponents"
                :key="comp.type"
                class="component-card"
                @click="handleAddComponent(comp.type)"
                @contextmenu.prevent="handleShowContextMenu($event, comp)"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
            >
                <!-- <div class="component-icon">{{ comp.icon }}</div> -->
                <div class="component-info">
                    <div class="component-name">{{ comp.displayName }}</div>
                    <div class="component-desc">{{ comp.description }}</div>
                    <div v-if="comp.category" class="component-category">
                        {{ getCategoryLabel(comp.category) }}
                    </div>
                </div>
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

        <!-- 快速测试 -->
        <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="text-xs font-medium text-gray-500 mb-2">快速测试</div>
            <Button variant="primary" size="sm" block @click="addTestModel">
                添加测试模型
            </Button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import ContextMenu from '@/components/ui/ContextMenu.vue';
import { useComponent } from '@/composables/useComponent';
import { getEnabledComponents, componentCategories } from '@/config/components';

const emit = defineEmits(['component-added']);

// 搜索关键词
const searchKeyword = ref('');

// 选中的分类
const selectedCategory = ref('all');

// 分类列表
const categories = computed(() => {
    return [
        { key: 'all', label: '全部' },
        ...componentCategories.map((cat) => ({
            key: cat.key,
            label: cat.label
        }))
    ];
});

// 可用组件列表
const availableComponents = computed(() => getEnabledComponents());

// 过滤后的组件列表
const filteredComponents = computed(() => {
    let filtered = availableComponents.value;

    // 分类过滤
    if (selectedCategory.value !== 'all') {
        filtered = filtered.filter((comp) => comp.category === selectedCategory.value);
    }

    // 搜索过滤
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        filtered = filtered.filter(
            (comp) =>
                comp.displayName.toLowerCase().includes(keyword) ||
                comp.description.toLowerCase().includes(keyword) ||
                comp.type.toLowerCase().includes(keyword)
        );
    }

    return filtered;
});

// 使用组件管理
const { addComponent } = useComponent();

// 右键菜单状态
const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    component: null
});

// 右键菜单项
const contextMenuItems = computed(() => {
    if (!contextMenu.value.component) return [];

    return [
        {
            icon: '➕',
            label: '添加到场景',
            action: 'add'
        },
        {
            divider: true
        },
        {
            icon: 'ℹ️',
            label: '查看详情',
            action: 'info',
            disabled: true // 暂未实现
        }
    ];
});

/**
 * 获取分类标签
 */
const getCategoryLabel = (categoryKey) => {
    const category = componentCategories.find((cat) => cat.key === categoryKey);
    return category ? category.label : categoryKey;
};

/**
 * 搜索处理
 */
const handleSearch = () => {
    // 搜索逻辑已在 computed 中处理
};

/**
 * 添加组件
 */
const handleAddComponent = async (type) => {
    try {
        const component = await addComponent(type);
        emit('component-added', component);
    } catch (error) {
        console.error('Failed to add component:', error);
        alert(`添加组件失败: ${error.message}`);
    }
};

/**
 * 拖拽开始
 */
const handleDragStart = (event, comp) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('component-type', comp.type);
    event.dataTransfer.setData('component-name', comp.displayName);
};

/**
 * 显示右键菜单
 */
const handleShowContextMenu = (event, comp) => {
    contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        component: comp
    };
};

/**
 * 处理右键菜单选择
 */
const handleContextMenuSelect = (item) => {
    const comp = contextMenu.value.component;
    if (!comp) return;

    switch (item.action) {
        case 'add':
            handleAddComponent(comp.type);
            break;
        case 'info':
            // TODO: 显示组件详情
            alert(`组件详情：\n名称：${comp.displayName}\n类型：${comp.type}\n描述：${comp.description}`);
            break;
    }
};

/**
 * 添加测试模型
 */
const addTestModel = async () => {
    try {
        const component = await addComponent('ModelLoader', {
            url: '/models/ShaderBall.glb',
            position: [0, 0, 0],
            scale: 1
        });
        emit('component-added', component);
    } catch (error) {
        console.error('Failed to add test model:', error);
        alert(`添加测试模型失败: ${error.message}`);
    }
};
</script>

<style scoped>
.component-library {
    @apply h-full flex flex-col;
}

.category-btn {
    @apply px-3 py-1 text-xs rounded border border-gray-300;
    @apply hover:bg-gray-100 transition-colors;
}

.category-btn.active {
    @apply bg-primary-500 text-white border-primary-500;
}

.component-list {
    @apply flex-1 overflow-y-auto space-y-2;
}

.empty-state {
    @apply flex items-center justify-center h-32;
}

.component-card {
    @apply flex items-start gap-3 p-3 rounded cursor-pointer;
    @apply border border-gray-200 hover:border-primary-300;
    @apply hover:bg-primary-50 transition-all;
    @apply select-none;
}

.component-card:active {
    @apply scale-95;
}

.component-icon {
    @apply text-3xl flex-shrink-0;
}

.component-info {
    @apply flex-1 min-w-0;
}

.component-name {
    @apply text-sm font-medium text-gray-900 mb-1;
}

.component-desc {
    @apply text-xs text-gray-500 mb-1;
}

.component-category {
    @apply text-xs text-primary-600 font-medium;
}
</style>

