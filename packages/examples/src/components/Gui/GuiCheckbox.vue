<template>
    <div class="checkbox-group">
        <input
            type="checkbox"
            :id="checkboxId"
            :checked="modelValue"
            @change="handleChange"
        />
        <label :for="checkboxId">{{ label }}</label>
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
        type: Boolean,
        required: true
    },
    id: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const checkboxId = computed(() => {
    return props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
});

const handleChange = (event) => {
    const value = event.target.checked;
    emit('update:modelValue', value);
    emit('change', value);
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

