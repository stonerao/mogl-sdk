<template>
  <div v-if="visible" class="image-selector-dialog" @click="handleClose">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <h3>选择图片</h3>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <div class="dialog-body">
        <!-- 搜索框 -->
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索图片..."
            class="search-input"
          >
        </div>

        <!-- 图片网格 -->
        <div class="images-grid custom-scrollbar">
          <div v-if="filteredImages.length === 0" class="empty-state">
            <span class="empty-icon">🖼️</span>
            <p>{{ searchQuery ? '未找到匹配的图片' : '暂无图片资源' }}</p>
            <button class="btn-upload" @click="openImageAssetsPanel">
              前往上传图片
            </button>
          </div>

          <div
            v-for="image in filteredImages"
            :key="image.id"
            class="image-item"
            :class="{ selected: selectedId === image.id }"
            @click="handleSelect(image)"
          >
            <div class="image-preview">
              <img :src="image.thumbnail || image.url" :alt="image.name">
            </div>
            <div class="image-name" :title="image.name">{{ image.name }}</div>
            <div class="image-size">{{ image.width }}×{{ image.height }}</div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <button class="btn-confirm" :disabled="!selectedId" @click="handleConfirm">
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useImageAssetsStore } from '@/store';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  defaultImageId: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:visible', 'select', 'close']);

// Store
const imageAssetsStore = useImageAssetsStore();

// 状态
const searchQuery = ref('');
const selectedId = ref(props.defaultImageId);

// 计算属性
const filteredImages = computed(() => {
  const images = imageAssetsStore.images;
  if (!searchQuery.value) {
    return images;
  }
  
  const query = searchQuery.value.toLowerCase();
  return images.filter(img => 
    img.name.toLowerCase().includes(query)
  );
});

// 方法
const handleSelect = (image) => {
  selectedId.value = image.id;
};

const handleConfirm = () => {
  if (selectedId.value) {
    const image = imageAssetsStore.getImageById(selectedId.value);
    emit('select', image);
    handleClose();
  }
};

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

const openImageAssetsPanel = () => {
  // 触发打开图片资源面板的事件
  window.dispatchEvent(new CustomEvent('open-image-assets-panel'));
  handleClose();
};
</script>

<style scoped>
.image-selector-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog-content {
  background: var(--bg-primary);
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.close-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

.dialog-body {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.images-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 4px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.btn-upload {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.btn-upload:hover {
  background: var(--primary-hover);
}

.image-item {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-item.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-alpha);
}

.image-preview {
  width: 100%;
  height: 120px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-name {
  padding: 8px;
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  padding: 0 8px 8px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel,
.btn-confirm {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background: var(--bg-hover);
}

.btn-confirm {
  background: var(--primary-color);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

