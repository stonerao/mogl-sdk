<template>
    <button
        class="btn"
        :class="[variantClass, sizeClass, { 'btn-block': block }]"
        :disabled="disabled"
        @click="handleClick"
    >
        <slot></slot>
    </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'primary', 'danger', 'ghost'].includes(value)
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    block: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['click']);

const variantClass = computed(() => {
    const variants = {
        default: 'btn-default',
        primary: 'btn-primary',
        danger: 'btn-danger',
        ghost: 'btn-ghost'
    };
    return variants[props.variant];
});

const sizeClass = computed(() => {
    const sizes = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg'
    };
    return sizes[props.size];
});

const handleClick = (event) => {
    if (!props.disabled) {
        emit('click', event);
    }
};
</script>

<style scoped>
.btn {
    @apply inline-flex items-center justify-center font-medium rounded transition-colors;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* 尺寸 */
.btn-sm {
    @apply px-3 py-1.5 text-sm;
}

.btn-md {
    @apply px-4 py-2 text-sm;
}

.btn-lg {
    @apply px-6 py-3 text-base;
}

/* 变体 */
.btn-default {
    @apply bg-white border border-gray-300 text-gray-700;
    @apply hover:bg-gray-50 hover:border-gray-400;
    @apply focus:ring-gray-500;
}

.btn-primary {
    @apply bg-primary-600 text-white border border-transparent;
    @apply hover:bg-primary-700;
    @apply focus:ring-primary-500;
}

.btn-danger {
    @apply bg-red-600 text-white border border-transparent;
    @apply hover:bg-red-700;
    @apply focus:ring-red-500;
}

.btn-ghost {
    @apply bg-transparent text-gray-700 border border-transparent;
    @apply hover:bg-gray-100;
    @apply focus:ring-gray-500;
}

/* 块级按钮 */
.btn-block {
    @apply w-full;
}
</style>

