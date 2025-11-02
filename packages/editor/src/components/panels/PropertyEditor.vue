<template>
    <div class="property-editor">
        <!-- 未选中组件 -->
        <div v-if="!selectedComponent" class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">请选择一个组件以编辑属性</div>
        </div>

        <!-- 已选中组件 -->
        <div v-else class="property-content">
            <!-- 组件基本信息 -->
            <div class="component-info">
                <div class="info-row">
                    <span class="info-label">名称:</span>
                    <Input
                        :model-value="selectedComponent.name"
                        @update:model-value="updateComponentName"
                        placeholder="组件名称"
                    />
                </div>
                <div class="info-row">
                    <span class="info-label">类型:</span>
                    <span class="info-value">{{ componentMetadata?.displayName || selectedComponent.type }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">ID:</span>
                    <span class="info-value text-xs">{{ selectedComponent.id }}</span>
                </div>
            </div>

            <!-- 属性分组 -->
            <Accordion :items="accordionItems" :default-open="['transform', 'properties']">
                <template #transform>
                    <TransformEditor
                        :position="componentConfig.position || [0, 0, 0]"
                        :rotation="componentConfig.rotation || [0, 0, 0]"
                        :scale="componentConfig.scale || 1"
                        @update:position="updateConfig('position', $event)"
                        @update:rotation="updateConfig('rotation', $event)"
                        @update:scale="updateConfig('scale', $event)"
                    />
                </template>

                <template #properties>
                    <div class="properties-list">
                        <div
                            v-for="field in configSchema"
                            :key="field.key"
                            class="property-field"
                        >
                            <!-- 文本输入 -->
                            <div v-if="field.type === 'text'" class="field-group">
                                <label>{{ field.label }}</label>
                                <div class="input-with-button">
                                    <Input
                                        :model-value="componentConfig[field.key]"
                                        @update:model-value="updateConfig(field.key, $event)"
                                        :placeholder="field.placeholder"
                                    />
                                    <!-- ModelLoader URL 字段的资源选择按钮 -->
                                    <button
                                        v-if="isModelLoader && field.key === 'url'"
                                        class="btn-select-asset"
                                        @click="openAssetPicker"
                                        title="从资源库选择"
                                    >
                                        📁
                                    </button>
                                </div>
                            </div>

                            <!-- 数字输入 -->
                            <div v-else-if="field.type === 'number'" class="field-group">
                                <label>{{ field.label }}</label>
                                <Slider
                                    :model-value="componentConfig[field.key] ?? field.default"
                                    @update:model-value="updateConfig(field.key, $event)"
                                    :min="field.min"
                                    :max="field.max"
                                    :step="field.step"
                                />
                            </div>

                            <!-- 颜色选择 -->
                            <div v-else-if="field.type === 'color'" class="field-group">
                                <label>{{ field.label }}</label>
                                <ColorPicker
                                    :model-value="componentConfig[field.key] ?? field.default"
                                    @update:model-value="updateConfig(field.key, $event)"
                                />
                            </div>

                            <!-- 布尔值 -->
                            <div v-else-if="field.type === 'boolean'" class="field-group-inline">
                                <label>{{ field.label }}</label>
                                <input
                                    type="checkbox"
                                    :checked="componentConfig[field.key] ?? field.default"
                                    @change="updateConfig(field.key, $event.target.checked)"
                                    class="checkbox"
                                />
                            </div>

                            <!-- 下拉选择 -->
                            <div v-else-if="field.type === 'select'" class="field-group">
                                <label>{{ field.label }}</label>
                                <Select
                                    :model-value="componentConfig[field.key] ?? field.default"
                                    @update:model-value="updateConfig(field.key, $event)"
                                    :options="field.options"
                                />
                            </div>

                            <!-- Vector3 -->
                            <div v-else-if="field.type === 'vector3'" class="field-group">
                                <label>{{ field.label }}</label>
                                <div class="vector3-inputs">
                                    <Input
                                        type="number"
                                        :model-value="(componentConfig[field.key] || field.default)[0]"
                                        @update:model-value="updateVector3(field.key, 0, $event)"
                                        placeholder="X"
                                        :step="0.1"
                                    />
                                    <Input
                                        type="number"
                                        :model-value="(componentConfig[field.key] || field.default)[1]"
                                        @update:model-value="updateVector3(field.key, 1, $event)"
                                        placeholder="Y"
                                        :step="0.1"
                                    />
                                    <Input
                                        type="number"
                                        :model-value="(componentConfig[field.key] || field.default)[2]"
                                        @update:model-value="updateVector3(field.key, 2, $event)"
                                        placeholder="Z"
                                        :step="0.1"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- 无属性提示 -->
                        <div v-if="configSchema.length === 0" class="no-properties">
                            该组件没有可配置的属性
                        </div>
                    </div>
                </template>

                <!-- ModelLoader 高级功能 -->
                <template v-if="isModelLoader" #modelloader>
                    <ModelLoaderEditor
                        v-if="selectedComponent"
                        :component-id="selectedComponent.id"
                    />
                </template>
            </Accordion>
        </div>

        <!-- 资源选择器 -->
        <AssetPickerModal
            v-model="showAssetPicker"
            @select="handleAssetSelect"
        />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useComponentStore } from '@/stores/useComponentStore';
import { useComponent } from '@/composables/useComponent';
import { useToast } from '@/composables/useToast';
import { getComponent } from '@/utils/componentRegistry';
import { Validator } from '@/utils/validator';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Slider from '@/components/ui/Slider.vue';
import ColorPicker from '@/components/ui/ColorPicker.vue';
import Accordion from '@/components/ui/Accordion.vue';
import TransformEditor from './TransformEditor.vue';
import ModelLoaderEditor from './ModelLoaderEditor.vue';
import AssetPickerModal from './AssetPickerModal.vue';

const componentStore = useComponentStore();
const { updateComponentConfig } = useComponent();
const toast = useToast();

const selectedComponent = computed(() => componentStore.selectedComponent);

// 获取组件元数据
const componentMetadata = computed(() => {
    if (!selectedComponent.value) return null;
    const comp = getComponent(selectedComponent.value.type);
    return comp?.metadata || null;
});

// 获取组件配置
const componentConfig = computed(() => {
    return selectedComponent.value?.config || {};
});

// 获取配置 Schema（过滤掉 transform 相关的字段）
const configSchema = computed(() => {
    if (!componentMetadata.value) return [];
    return (componentMetadata.value.configSchema || []).filter(
        (field) => !['position', 'rotation', 'scale'].includes(field.key)
    );
});

// 是否是 ModelLoader 组件
const isModelLoader = computed(() => {
    return selectedComponent.value?.type === 'ModelLoader';
});

// Accordion 配置
const accordionItems = computed(() => {
    const items = [
        {
            key: 'transform',
            label: '变换 (Transform)',
            icon: '📐'
        }
    ];

    if (configSchema.value.length > 0) {
        items.push({
            key: 'properties',
            label: '属性 (Properties)',
            icon: '⚙️'
        });
    }

    // 如果是 ModelLoader，添加高级功能面板
    if (isModelLoader.value) {
        items.push({
            key: 'modelloader',
            label: 'ModelLoader 高级',
            icon: '🎨'
        });
    }

    return items;
});

// 验证单个字段
const validateField = (field, value) => {
    const schema = {
        [field.key]: {
            label: field.label,
            required: field.required,
            type: field.type,
            min: field.min,
            max: field.max,
            validator: field.validator
        }
    };

    return Validator.validate({ [field.key]: value }, schema);
};

// 更新组件名称
const updateComponentName = (name) => {
    if (selectedComponent.value) {
        componentStore.updateComponent(selectedComponent.value.id, { name });
    }
};

// 更新配置
const updateConfig = (key, value) => {
    if (!selectedComponent.value) return;

    try {
        // 验证配置值
        const field = configSchema.value.find((f) => f.key === key);
        if (field) {
            const validationResult = validateField(field, value);
            if (!validationResult.isValid()) {
                const errors = validationResult.getErrors();
                toast.error(`配置验证失败: ${errors[key] || '无效的值'}`);
                return;
            }
        }

        // 使用 useComponent 的方法来更新配置，这会同时更新 store 和场景实例
        updateComponentConfig(selectedComponent.value.id, { [key]: value });
    } catch (error) {
        console.error('Failed to update config:', error);
        toast.error(`更新配置失败: ${error.message}`);
    }
};

// 更新 Vector3 值
const updateVector3 = (key, index, value) => {
    const currentValue = componentConfig.value[key] || [0, 0, 0];
    const newValue = [...currentValue];
    newValue[index] = parseFloat(value) || 0;
    updateConfig(key, newValue);
};

// 资源选择器状态
const showAssetPicker = ref(false);

// 打开资源选择器
const openAssetPicker = () => {
    showAssetPicker.value = true;
};

// 处理资源选择
const handleAssetSelect = (asset) => {
    if (asset && asset.url) {
        updateConfig('url', asset.url);
    }
};
</script>

<style scoped>
.property-editor {
    @apply h-full overflow-y-auto;
}

.empty-state {
    @apply flex flex-col items-center justify-center h-full text-gray-400;
}

.empty-icon {
    @apply text-6xl mb-4;
}

.empty-text {
    @apply text-sm;
}

.property-content {
    @apply p-1 space-y-4;
}

.component-info {
    @apply bg-gray-50 rounded p-3 space-y-2 text-sm;
}

.info-row {
    @apply flex items-center gap-2;
}

.info-label {
    @apply font-medium text-gray-600 min-w-[50px];
}

.info-value {
    @apply text-gray-800;
}

.properties-list {
    @apply space-y-3;
}

.property-field {
    @apply text-sm;
}

.field-group {
    @apply flex flex-col gap-1;
}

.field-group label {
    @apply font-medium text-gray-700;
}

.input-with-button {
    @apply flex gap-2;
}

.input-with-button .input {
    @apply flex-1;
}

.btn-select-asset {
    @apply flex-shrink-0 w-10 h-10 flex items-center justify-center;
    @apply bg-gray-100 hover:bg-gray-200 rounded transition-colors;
    @apply text-lg cursor-pointer border border-gray-300;
}

.field-group-inline {
    @apply flex items-center justify-between;
}

.field-group-inline label {
    @apply font-medium text-gray-700;
}

.checkbox {
    @apply w-4 h-4 rounded border-gray-300;
}

.vector3-inputs {
    @apply grid grid-cols-3 gap-2;
}

.no-properties {
    @apply text-center text-gray-400 py-4;
}
</style>

