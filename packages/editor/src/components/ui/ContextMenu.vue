<template>
    <Teleport to="body">
        <Transition name="context-menu">
            <div
                v-if="visible"
                ref="menuRef"
                class="context-menu"
                :style="menuStyle"
                @click.stop
            >
                <div
                    v-for="(item, index) in items"
                    :key="index"
                    class="context-menu-item"
                    :class="{
                        'disabled': item.disabled,
                        'divider': item.divider
                    }"
                    @click="handleItemClick(item)"
                >
                    <template v-if="!item.divider">
                        <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
                        <span class="item-label">{{ item.label }}</span>
                        <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
                    </template>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    x: {
        type: Number,
        default: 0
    },
    y: {
        type: Number,
        default: 0
    },
    items: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:visible', 'select']);

const menuRef = ref(null);

// 菜单样式（位置）
const menuStyle = computed(() => {
    return {
        left: `${props.x}px`,
        top: `${props.y}px`
    };
});

// 处理菜单项点击
const handleItemClick = (item) => {
    if (item.disabled || item.divider) return;

    emit('select', item);
    emit('update:visible', false);

    if (item.action) {
        item.action();
    }
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
    if (menuRef.value && !menuRef.value.contains(event.target)) {
        emit('update:visible', false);
    }
};

// 按 ESC 键关闭菜单
const handleEscape = (event) => {
    if (event.key === 'Escape') {
        emit('update:visible', false);
    }
};

// 监听 visible 变化
watch(() => props.visible, (newValue) => {
    if (newValue) {
        // 菜单打开时，添加事件监听
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 0);
    } else {
        // 菜单关闭时，移除事件监听
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
    }
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.context-menu {
    @apply fixed z-50 min-w-[180px];
    @apply bg-white rounded-lg shadow-lg border border-gray-200;
    @apply py-1;
}

.context-menu-item {
    @apply flex items-center gap-2 px-3 py-2;
    @apply text-sm text-gray-700 cursor-pointer;
    @apply hover:bg-gray-100 transition-colors;
}

.context-menu-item.disabled {
    @apply text-gray-400 cursor-not-allowed;
    @apply hover:bg-transparent;
}

.context-menu-item.divider {
    @apply h-px bg-gray-200 my-1 px-0 py-0;
    @apply cursor-default hover:bg-gray-200;
}

.item-icon {
    @apply flex-shrink-0 w-4 text-center;
}

.item-label {
    @apply flex-1;
}

.item-shortcut {
    @apply flex-shrink-0 text-xs text-gray-400;
}

/* 过渡动画 */
.context-menu-enter-active,
.context-menu-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>

