<template>
    <div class="color-input-group">
        <label>{{ label }}</label>
        <input
            type="color"
            :value="modelValue"
            @input="handleInput"
        />
        <span class="color-value">{{ modelValue }}</span>
    </div>
</template>

<script setup>
const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleInput = (event) => {
    const value = event.target.value;
    emit('update:modelValue', value);
    emit('change', value);
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

