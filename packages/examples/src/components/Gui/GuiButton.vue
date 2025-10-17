<template>
    <button
        :class="buttonClasses"
        :disabled="disabled"
        @click="handleClick"
    >
        <slot>{{ label }}</slot>
    </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    variant: {
        type: String,
        default: 'primary', // primary, secondary, danger, warning
        validator: (value) => ['primary', 'secondary', 'danger', 'warning'].includes(value)
    },
    size: {
        type: String,
        default: 'normal', // small, normal, large
        validator: (value) => ['small', 'normal', 'large'].includes(value)
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

const buttonClasses = computed(() => {
    const classes = ['btn'];
    
    if (props.variant !== 'primary') {
        classes.push(`btn-${props.variant}`);
    }
    
    if (props.size !== 'normal') {
        classes.push(`btn-${props.size}`);
    }
    
    if (props.block) {
        classes.push('btn-block');
    }
    
    return classes.join(' ');
});

const handleClick = (event) => {
    if (!props.disabled) {
        emit('click', event);
    }
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

