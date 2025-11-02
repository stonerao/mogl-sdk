<template>
    <Modal
        v-model="isOpen"
        title="选择模型文件"
        width="700px"
        @close="handleClose"
    >
        <!-- 搜索框 -->
        <div class="search-bar">
            <Input
                v-model="searchQuery"
                placeholder="搜索模型文件..."
                class="search-input"
            />
        </div>

        <!-- 资源列表 -->
        <div v-if="filteredModelAssets.length > 0" class="asset-list">
            <div
                v-for="asset in filteredModelAssets"
                :key="asset.id"
                class="asset-item"
                :class="{ 'selected': selectedAsset?.id === asset.id }"
                @click="selectAsset(asset)"
            >
                <!-- 缩略图 -->
                <div class="asset-thumbnail">
                    <img
                        v-if="asset.thumbnail"
                        :src="asset.thumbnail"
                        :alt="asset.name"
                        class="thumbnail-image"
                    />
                    <div v-else class="thumbnail-placeholder">
                        {{ getFileExtension(asset.fileName) }}
                    </div>
                </div>

                <!-- 资源信息 -->
                <div class="asset-info">
                    <div class="asset-name">{{ asset.name }}</div>
                    <div class="asset-meta">
                        <span class="asset-filename">{{ asset.fileName }}</span>
                        <span v-if="asset.size" class="asset-size">{{ formatFileSize(asset.size) }}</span>
                    </div>
                </div>

                <!-- 选中标记 -->
                <div v-if="selectedAsset?.id === asset.id" class="asset-check">✓</div>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
            <div class="empty-icon">📦</div>
            <div class="empty-text">暂无模型资源</div>
            <div class="empty-hint">请先在左侧资源库中上传模型文件（.glb、.gltf、.fbx）</div>
        </div>

        <!-- 底部按钮 -->
        <template #footer>
            <Button variant="secondary" @click="handleClose">取消</Button>
            <Button
                variant="primary"
                :disabled="!selectedAsset"
                @click="handleConfirm"
            >
                确定
            </Button>
        </template>
    </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAssetStore } from '@/stores/useAssetStore';
import { useToast } from '@/composables/useToast';
import Modal from '@/components/ui/Modal.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'select']);

const assetStore = useAssetStore();
const toast = useToast();

// 状态
const isOpen = ref(props.modelValue);
const searchQuery = ref('');
const selectedAsset = ref(null);

// 支持的模型文件扩展名
const MODEL_EXTENSIONS = ['.glb', '.gltf', '.fbx'];

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
    isOpen.value = newValue;
    if (newValue) {
        // 打开时重置状态
        searchQuery.value = '';
        selectedAsset.value = null;
    }
});

// 监听 isOpen 变化
watch(isOpen, (newValue) => {
    emit('update:modelValue', newValue);
});

// 过滤模型资源
const modelAssets = computed(() => {
    return assetStore.assets.filter((asset) => {
        // 过滤条件：category 为 'model' 且文件扩展名匹配
        if (asset.category !== 'model') return false;

        const fileName = asset.fileName.toLowerCase();
        return MODEL_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    });
});

// 搜索过滤
const filteredModelAssets = computed(() => {
    if (!searchQuery.value) {
        return modelAssets.value;
    }

    const keyword = searchQuery.value.toLowerCase();
    return modelAssets.value.filter((asset) => {
        return (
            asset.name.toLowerCase().includes(keyword) ||
            asset.fileName.toLowerCase().includes(keyword)
        );
    });
});

// 选择资源
const selectAsset = (asset) => {
    selectedAsset.value = asset;
};

// 确认选择
const handleConfirm = () => {
    if (!selectedAsset.value) {
        toast.warning('请先选择一个模型文件');
        return;
    }

    emit('select', selectedAsset.value);
    toast.success(`已选择模型: ${selectedAsset.value.name}`);
    handleClose();
};

// 关闭对话框
const handleClose = () => {
    isOpen.value = false;
};

// 获取文件扩展名
const getFileExtension = (fileName) => {
    if (!fileName) return '';
    const parts = fileName.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1].toUpperCase()}` : '';
};

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>

<style scoped>
.search-bar {
    @apply mb-4;
}

.search-input {
    @apply w-full;
}

.asset-list {
    @apply space-y-2 max-h-96 overflow-y-auto;
}

.asset-item {
    @apply flex items-center gap-3 p-3 rounded-lg border border-gray-200;
    @apply hover:bg-gray-50 cursor-pointer transition-colors;
}

.asset-item.selected {
    @apply bg-primary-50 border-primary-500;
}

.asset-thumbnail {
    @apply flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-100;
    @apply flex items-center justify-center;
}

.thumbnail-image {
    @apply w-full h-full object-cover;
}

.thumbnail-placeholder {
    @apply text-xs font-bold text-gray-400;
}

.asset-info {
    @apply flex-1 min-w-0;
}

.asset-name {
    @apply font-medium text-gray-900 truncate;
}

.asset-meta {
    @apply flex items-center gap-2 mt-1 text-xs text-gray-500;
}

.asset-filename {
    @apply truncate;
}

.asset-size {
    @apply flex-shrink-0;
}

.asset-check {
    @apply flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white;
    @apply flex items-center justify-center font-bold;
}

.empty-state {
    @apply flex flex-col items-center justify-center py-12 text-center;
}

.empty-icon {
    @apply text-6xl mb-4;
}

.empty-text {
    @apply text-lg font-medium text-gray-700 mb-2;
}

.empty-hint {
    @apply text-sm text-gray-500;
}
</style>

