<template>
    <div class="input-group">
        <label v-if="label">{{ label }}</label>
        <input
            type="number"
            :value="modelValue"
            :min="min"
            :max="max"
            :step="step"
            :placeholder="placeholder"
            @input="handleInput"
        />
    </div>
</template>

<script setup>
const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    modelValue: {
        type: Number,
        required: true
    },
    min: {
        type: Number,
        default: undefined
    },
    max: {
        type: Number,
        default: undefined
    },
    step: {
        type: Number,
        default: 0.1
    },
    placeholder: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleInput = (event) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
        emit('update:modelValue', value);
        emit('change', value);
    }
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

