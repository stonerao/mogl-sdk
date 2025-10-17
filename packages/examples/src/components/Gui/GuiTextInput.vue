<template>
    <div class="gui-text-input">
        <label v-if="label" class="input-label">{{ label }}</label>
        <input
            type="text"
            class="text-input"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            @input="$emit('update:modelValue', $event.target.value)"
            @keyup.enter="$emit('enter')"
            @blur="$emit('blur')"
            @focus="$emit('focus')"
        />
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        default: ''
    },
    modelValue: {
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
    }
});

defineEmits(['update:modelValue', 'enter', 'blur', 'focus']);
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.gui-text-input {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-label {
    font-size: 12px;
    font-weight: 500;
    color: @text-color;
}

.text-input {
    .input-base();
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}
</style>

