<template>
    <div class="color-picker-wrapper">
        <label v-if="label" class="color-picker-label">
            {{ label }}
        </label>
        <div class="color-picker-container">
            <div class="color-preview" :style="{ backgroundColor: modelValue }"></div>
            <input
                type="color"
                :value="modelValue"
                :disabled="disabled"
                class="color-input"
                @input="handleInput"
                @change="handleChange"
            />
            <input
                type="text"
                :value="modelValue"
                :disabled="disabled"
                class="color-text-input"
                placeholder="#000000"
                @input="handleTextInput"
                @blur="handleBlur"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: '#000000'
    },
    label: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleInput = (event) => {
    emit('update:modelValue', event.target.value);
};

const handleChange = (event) => {
    emit('change', event.target.value);
};

const handleTextInput = (event) => {
    const value = event.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        emit('update:modelValue', value);
    }
};

const handleBlur = (event) => {
    const value = event.target.value;
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
        event.target.value = props.modelValue;
    }
};
</script>

<style scoped>
.color-picker-wrapper {
    @apply w-full;
}

.color-picker-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
}

.color-picker-container {
    @apply flex items-center gap-2;
}

.color-preview {
    @apply w-8 h-8 rounded border border-gray-300;
}

.color-input {
    @apply w-0 h-0 opacity-0 absolute;
}

.color-text-input {
    @apply flex-1 px-3 py-2 text-sm border border-gray-300 rounded font-mono;
    @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
    @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
}

.color-preview {
    @apply cursor-pointer;
}

.color-preview:hover {
    @apply ring-2 ring-primary-500;
}
</style>

