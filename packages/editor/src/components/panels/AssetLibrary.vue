<template>
    <div class="asset-library">
        <!-- 工具栏 -->
        <div class="toolbar">
            <Input
                v-model="searchKeyword"
                placeholder="搜索资源..."
                size="sm"
                @input="handleSearch"
            />
            <Button variant="primary" size="sm" @click="handleUpload">
                <!-- <span class="text-xs">📤</span> -->
                <span>上传</span>
            </Button>
        </div>

        <!-- 分类标签 -->
        <Tabs v-model="selectedCategory" :tabs="categoryTabs" class="mb-3" />

        <!-- 资源列表 -->
        <div class="asset-list">
            <div v-if="filteredAssets.length === 0" class="empty-state">
                <div class="text-4xl mb-2">📁</div>
                <div class="text-sm text-gray-400">暂无资源</div>
                <div class="text-xs text-gray-400 mt-1">点击上传按钮添加资源</div>
            </div>

            <div v-else class="asset-grid">
                <div
                    v-for="asset in filteredAssets"
                    :key="asset.id"
                    class="asset-card"
                    @click="handleSelectAsset(asset)"
                    @dblclick="handleUseAsset(asset)"
                    draggable="true"
                    @dragstart="handleDragStart($event, asset)"
                >
                    <!-- 缩略图 -->
                    <div class="asset-thumbnail">
                        <div v-if="asset.thumbnail" class="thumbnail-image">
                            <img :src="asset.thumbnail" :alt="asset.name" />
                        </div>
                        <div v-else class="thumbnail-placeholder">
                            {{ getAssetIcon(asset.type) }}
                        </div>
                    </div>

                    <!-- 资源信息 -->
                    <div class="asset-info">
                        <div class="asset-name" :title="asset.name">{{ asset.name }}</div>
                        <div class="asset-meta">
                            <span class="asset-type">{{ asset.type.toUpperCase() }}</span>
                            <span v-if="asset.size" class="asset-size">{{
                                formatFileSize(asset.size)
                            }}</span>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="asset-actions">
                        <button
                            class="action-btn"
                            @click.stop="handleUseAsset(asset)"
                            title="使用资源"
                        >
                            ✓
                        </button>
                        <button
                            class="action-btn danger"
                            @click.stop="handleDeleteAsset(asset.id)"
                            title="删除资源"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 文件上传输入（隐藏） -->
        <input
            ref="fileInputRef"
            type="file"
            multiple
            accept=".glb,.gltf,.jpg,.jpeg,.png,.hdr,.exr"
            style="display: none"
            @change="handleFileChange"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import Tabs from '@/components/ui/Tabs.vue';
import { useAssetStore } from '@/stores/useAssetStore';
import { useComponent } from '@/composables/useComponent';

const emit = defineEmits(['asset-selected', 'asset-used']);

// 使用资源管理
const assetStore = useAssetStore();
const { addComponent } = useComponent();

// 文件输入引用
const fileInputRef = ref(null);

// 搜索关键词
const searchKeyword = computed({
    get: () => assetStore.searchKeyword,
    set: (value) => assetStore.setSearchKeyword(value)
});

// 选中的分类
const selectedCategory = computed({
    get: () => assetStore.selectedCategory,
    set: (value) => assetStore.setSelectedCategory(value)
});

// 分类标签
const categoryTabs = computed(() => [
    {
        key: 'model',
        label: `模型 (${assetStore.getAssetCountByCategory('model')})`
    },
    {
        key: 'texture',
        label: `纹理 (${assetStore.getAssetCountByCategory('texture')})`
    },
    {
        key: 'hdr',
        label: `HDR (${assetStore.getAssetCountByCategory('hdr')})`
    },
    {
        key: 'image',
        label: `图片 (${assetStore.getAssetCountByCategory('image')})`
    }
]);

// 过滤后的资源列表
const filteredAssets = computed(() => assetStore.filteredAssets);

/**
 * 初始化
 */
onMounted(() => {
    // 初始化默认资源
    if (assetStore.assets.length === 0) {
        assetStore.initializeDefaultAssets();
    }
});

/**
 * 获取资源图标
 */
const getAssetIcon = (type) => {
    const iconMap = {
        glb: '🎨',
        gltf: '🎨',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️',
        hdr: '🌅',
        exr: '🌅'
    };
    return iconMap[type.toLowerCase()] || '📄';
};

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 搜索处理
 */
const handleSearch = () => {
    // 搜索逻辑已在 store 中处理
};

/**
 * 选中资源
 */
const handleSelectAsset = (asset) => {
    emit('asset-selected', asset);
};

/**
 * 使用资源
 */
const handleUseAsset = async (asset) => {
    try {
        // 根据资源类型执行不同操作
        if (asset.category === 'model') {
            // 添加模型到场景
            await addComponent('ModelLoader', {
                url: asset.url,
                position: [0, 0, 0],
                scale: 1
            });
        } else if (asset.category === 'hdr') {
            // TODO: 设置为场景环境贴图
            alert('HDR 环境贴图功能将在后续版本实现');
        } else {
            alert('该资源类型暂不支持直接使用');
        }

        emit('asset-used', asset);
    } catch (error) {
        console.error('Failed to use asset:', error);
        alert(`使用资源失败: ${error.message}`);
    }
};

/**
 * 删除资源
 */
const handleDeleteAsset = (assetId) => {
    if (confirm('确定要删除这个资源吗？')) {
        assetStore.removeAsset(assetId);
    }
};

/**
 * 上传资源
 */
const handleUpload = () => {
    fileInputRef.value?.click();
};

/**
 * 文件选择处理
 */
const handleFileChange = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
        // 获取文件扩展名
        const ext = file.name.split('.').pop().toLowerCase();

        // 确定资源分类
        let category = 'image';
        if (['glb', 'gltf', 'fbx', 'obj'].includes(ext)) {
            category = 'model';
        } else if (['hdr', 'exr'].includes(ext)) {
            category = 'hdr';
        } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            category = 'texture';
        }

        // 创建本地 URL（实际项目中应该上传到服务器）
        const url = URL.createObjectURL(file);

        // 添加到资源库
        assetStore.addAsset({
            name: file.name.replace(/\.[^/.]+$/, ''),
            fileName: file.name,
            url: url,
            category: category,
            type: ext,
            size: file.size,
            thumbnail: ''
        });
    });

    // 清空文件输入
    event.target.value = '';

    alert(`成功添加 ${files.length} 个资源！\n注意：这些资源仅存储在浏览器内存中，刷新页面后会丢失。`);
};

/**
 * 拖拽开始
 */
const handleDragStart = (event, asset) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('asset-id', asset.id);
    event.dataTransfer.setData('asset-url', asset.url);
    event.dataTransfer.setData('asset-type', asset.category);
};
</script>

<style scoped>
.asset-library {
    @apply h-full flex flex-col;
}

.toolbar {
    @apply flex items-center gap-2 mb-3;
}

.asset-list {
    @apply flex-1 overflow-y-auto;
}

.empty-state {
    @apply flex flex-col items-center justify-center h-full text-center;
}

.asset-grid {
    @apply grid grid-cols-2 gap-2;
}

.asset-card {
    @apply border border-gray-200 rounded overflow-hidden;
    @apply hover:border-primary-300 hover:shadow-md;
    @apply cursor-pointer transition-all select-none;
    position: relative;
}

.asset-card:active {
    @apply scale-95;
}

.asset-thumbnail {
    @apply aspect-square bg-gray-100 flex items-center justify-center;
    @apply relative overflow-hidden;
}

.thumbnail-image {
    @apply w-full h-full;
}

.thumbnail-image img {
    @apply w-full h-full object-cover;
}

.thumbnail-placeholder {
    @apply text-4xl;
}

.asset-info {
    @apply p-2;
}

.asset-name {
    @apply text-xs font-medium text-gray-900 truncate mb-1;
}

.asset-meta {
    @apply flex items-center gap-2 text-xs text-gray-500;
}

.asset-type {
    @apply px-1 py-0.5 bg-gray-100 rounded;
}

.asset-size {
    @apply text-xs;
}

.asset-actions {
    @apply absolute top-2 right-2 flex gap-1;
    @apply opacity-0 transition-opacity;
}

.asset-card:hover .asset-actions {
    @apply opacity-100;
}

.action-btn {
    @apply w-6 h-6 rounded bg-white shadow-md;
    @apply flex items-center justify-center text-xs;
    @apply hover:bg-gray-100 transition-colors;
}

.action-btn.danger {
    @apply hover:bg-red-50 hover:text-red-600;
}
</style>

