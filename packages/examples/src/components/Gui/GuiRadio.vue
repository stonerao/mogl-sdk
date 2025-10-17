<template>
    <div class="radio-group">
        <label v-for="option in options" :key="getOptionValue(option)" class="radio-item">
            <input
                type="radio"
                :name="name"
                :value="getOptionValue(option)"
                :checked="modelValue === getOptionValue(option)"
                @change="handleChange"
            />
            <span>{{ getOptionLabel(option) }}</span>
        </label>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean],
        required: true
    },
    options: {
        type: Array,
        required: true
    },
    name: {
        type: String,
        default: () => `radio-${Math.random().toString(36).substr(2, 9)}`
    },
    valueKey: {
        type: String,
        default: 'value'
    },
    labelKey: {
        type: String,
        default: 'label'
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const getOptionValue = (option) => {
    if (typeof option === 'object' && option !== null) {
        return option[props.valueKey];
    }
    return option;
};

const getOptionLabel = (option) => {
    if (typeof option === 'object' && option !== null) {
        return option[props.labelKey];
    }
    return option;
};

const handleChange = (event) => {
    const value = event.target.value;
    // 尝试转换为原始类型
    let convertedValue = value;
    if (value === 'true') convertedValue = true;
    else if (value === 'false') convertedValue = false;
    else if (!isNaN(value) && value !== '') convertedValue = Number(value);
    
    emit('update:modelValue', convertedValue);
    emit('change', convertedValue);
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.radio-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    
    input[type='radio'] {
        width: 16px;
        height: 16px;
        accent-color: @primary-color;
        cursor: pointer;
    }
    
    span {
        user-select: none;
    }
    
    &:hover {
        color: @primary-color;
    }
}
</style>

