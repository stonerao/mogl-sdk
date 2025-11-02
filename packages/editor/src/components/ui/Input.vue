<template>
    <div class="input-wrapper">
        <label v-if="label" class="input-label">
            {{ label }}
        </label>
        <input
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            class="input"
            :class="{ 'input-error': error }"
            @input="handleInput"
            @blur="handleBlur"
            @focus="handleFocus"
        />
        <div v-if="error" class="input-error-message">
            {{ error }}
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const handleInput = (event) => {
    emit('update:modelValue', event.target.value);
};

const handleBlur = (event) => {
    emit('blur', event);
};

const handleFocus = (event) => {
    emit('focus', event);
};
</script>

<style scoped>
.input-wrapper {
    @apply w-full;
}

.input-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
}

.input {
    @apply w-full px-3 py-2 text-sm border border-gray-300 rounded;
    @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
    @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
    @apply transition-colors;
}

.input-error {
    @apply border-red-500;
    @apply focus:ring-red-500;
}

.input-error-message {
    @apply mt-1 text-xs text-red-600;
}
</style>

