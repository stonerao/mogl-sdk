<template>
    <div class="param-group">
        <label>{{ label }}</label>
        <input
            type="range"
            :min="min"
            :max="max"
            :step="step"
            :value="modelValue"
            :disabled="disabled"
            @input="handleInput"
        />
        <span class="value-display">{{ displayValue }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: Number,
        required: true
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    step: {
        type: Number,
        default: 1
    },
    precision: {
        type: Number,
        default: 0
    },
    suffix: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const displayValue = computed(() => {
    const value =
        props.precision > 0
            ? props.modelValue.toFixed(props.precision)
            : Math.round(props.modelValue);
    return props.suffix ? `${value}${props.suffix}` : value;
});

const handleInput = (event) => {
    const value = parseFloat(event.target.value);
    emit('update:modelValue', value);
    emit('change', value);
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

