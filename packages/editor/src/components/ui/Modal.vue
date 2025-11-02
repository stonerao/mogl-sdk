<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
                <div class="modal-container" :style="{ width: width }" @click.stop>
                    <!-- 模态框头部 -->
                    <div class="modal-header">
                        <h3 class="modal-title">{{ title }}</h3>
                        <button
                            v-if="showClose"
                            class="modal-close"
                            @click="handleClose"
                        >
                            ✕
                        </button>
                    </div>

                    <!-- 模态框内容 -->
                    <div class="modal-body">
                        <slot></slot>
                    </div>

                    <!-- 模态框底部 -->
                    <div v-if="$slots.footer" class="modal-footer">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: '500px'
    },
    showClose: {
        type: Boolean,
        default: true
    },
    closeOnClickOutside: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'close']);

const handleClose = () => {
    emit('update:modelValue', false);
    emit('close');
};

const handleOverlayClick = () => {
    if (props.closeOnClickOutside) {
        handleClose();
    }
};
</script>

<style scoped>
.modal-overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center;
    @apply bg-black bg-opacity-50;
}

.modal-container {
    @apply bg-white rounded-lg shadow-xl;
    @apply max-h-[90vh] flex flex-col;
}

.modal-header {
    @apply flex items-center justify-between px-6 py-4 border-b border-gray-200;
}

.modal-title {
    @apply text-lg font-semibold text-gray-900;
}

.modal-close {
    @apply text-gray-400 hover:text-gray-600 text-xl;
    @apply w-8 h-8 flex items-center justify-center rounded;
    @apply hover:bg-gray-100 transition-colors;
}

.modal-body {
    @apply px-6 py-4 overflow-y-auto flex-1;
}

.modal-footer {
    @apply px-6 py-4 border-t border-gray-200;
    @apply flex items-center justify-end gap-2;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    transform: scale(0.9);
}
</style>

