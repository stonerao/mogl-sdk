<template>
  <div class="image-assets-panel">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <button class="btn-upload" @click="triggerFileInput">
        <span class="icon">📤</span>
        <span>上传</span>
      </button>

      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索图片..."
          class="search-input"
        >
      </div>

      <div class="view-toggle">
        <button
          class="view-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="setViewMode('grid')"
          title="网格视图"
        >
          ⊞
        </button>
        <button
          class="view-btn"
          :class="{ active: viewMode === 'list' }"
          @click="setViewMode('list')"
          title="列表视图"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{ 'drag-over': isDraggingOver }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="triggerFileInput"
    >
      <div class="upload-hint">
        <span class="upload-icon">📁</span>
        <p>点击或拖拽图片到此处上传</p>
        <p class="upload-tips">支持 PNG, JPG, GIF, SVG, WebP（最大 5MB）</p>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
      multiple
      style="display: none"
      @change="handleFileSelect"
    >

    <!-- 图片列表 -->
    <div class="images-container custom-scrollbar">
      <div v-if="filteredImages.length === 0" class="empty-state">
        <span class="empty-icon">🖼️</span>
        <p>{{ searchQuery ? '未找到匹配的图片' : '暂无图片资源' }}</p>
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="images-grid">
        <div
          v-for="image in filteredImages"
          :key="image.id"
          class="image-card"
          :class="{ selected: selectedImageId === image.id }"
          @click="selectImage(image.id)"
        >
          <div class="image-preview">
            <img :src="image.thumbnail || image.url" :alt="image.name">
          </div>
          <div class="image-info">
            <div class="image-name" :title="image.name">{{ image.name }}</div>
            <div class="image-meta">{{ image.width }}×{{ image.height }}</div>
          </div>
          <div class="image-actions">
            <button class="action-btn" @click.stop="handleRename(image)" title="重命名">
              ✏️
            </button>
            <button class="action-btn" @click.stop="handlePreview(image)" title="预览">
              👁️
            </button>
            <button class="action-btn delete" @click.stop="handleDelete(image)" title="删除">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="images-list">
        <div
          v-for="image in filteredImages"
          :key="image.id"
          class="image-row"
          :class="{ selected: selectedImageId === image.id }"
          @click="selectImage(image.id)"
        >
          <div class="row-thumbnail">
            <img :src="image.thumbnail || image.url" :alt="image.name">
          </div>
          <div class="row-info">
            <div class="row-name">{{ image.name }}</div>
            <div class="row-meta">
              {{ image.width }}×{{ image.height }} · {{ formatFileSize(image.size) }}
            </div>
          </div>
          <div class="row-actions">
            <button class="action-btn" @click.stop="handleRename(image)" title="重命名">
              ✏️
            </button>
            <button class="action-btn" @click.stop="handlePreview(image)" title="预览">
              👁️
            </button>
            <button class="action-btn delete" @click.stop="handleDelete(image)" title="删除">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部统计 -->
    <div class="footer-stats">
      <span>共 {{ stats.count }} 张图片</span>
      <span>总大小 {{ stats.totalSizeMB }} MB</span>
    </div>

    <!-- 预览对话框 -->
    <div v-if="previewImage" class="preview-dialog" @click="closePreview">
      <div class="preview-content" @click.stop>
        <div class="preview-header">
          <h3>{{ previewImage.name }}</h3>
          <button class="close-btn" @click="closePreview">✕</button>
        </div>
        <div class="preview-body">
          <img :src="previewImage.url" :alt="previewImage.name">
        </div>
        <div class="preview-footer">
          <span>{{ previewImage.width }}×{{ previewImage.height }}</span>
          <span>{{ formatFileSize(previewImage.size) }}</span>
          <span>{{ previewImage.type }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useImageAssetsStore } from '@/store';

// Store
const imageAssetsStore = useImageAssetsStore();

// 状态
const fileInput = ref(null);
const isDraggingOver = ref(false);
const previewImage = ref(null);

// 计算属性
const searchQuery = computed({
  get: () => imageAssetsStore.searchQuery,
  set: (value) => imageAssetsStore.setSearchQuery(value)
});

const viewMode = computed(() => imageAssetsStore.viewMode);
const filteredImages = computed(() => imageAssetsStore.filteredImages);
const selectedImageId = computed(() => imageAssetsStore.selectedImageId);
const stats = computed(() => imageAssetsStore.stats);

// 方法
const setViewMode = (mode) => {
  imageAssetsStore.setViewMode(mode);
};

const selectImage = (imageId) => {
  imageAssetsStore.selectImage(imageId);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  processFiles(files);
  // 清空 input，允许重复选择同一文件
  event.target.value = '';
};

const handleDrop = (event) => {
  isDraggingOver.value = false;
  const files = Array.from(event.dataTransfer.files).filter(file =>
    file.type.startsWith('image/')
  );
  processFiles(files);
};

const handleDragOver = () => {
  isDraggingOver.value = true;
};

const handleDragLeave = () => {
  isDraggingOver.value = false;
};

const processFiles = async (files) => {
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    // 检查文件大小
    if (file.size > maxSize) {
      alert(`文件 ${file.name} 超过 5MB 限制`);
      continue;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert(`文件 ${file.name} 不是图片格式`);
      continue;
    }

    try {
      await uploadImage(file);
    } catch (error) {
      console.error('上传图片失败:', error);
      alert(`上传 ${file.name} 失败: ${error.message}`);
    }
  }
};

const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 创建缩略图
        const thumbnail = createThumbnail(img, 200, 200);

        // 添加到 store
        const imageData = {
          name: file.name,
          url: e.target.result,
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          thumbnail: thumbnail
        };

        imageAssetsStore.addImage(imageData);
        resolve();
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
};

const createThumbnail = (img, maxWidth, maxHeight) => {
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  // 计算缩放比例
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = width * ratio;
    height = height * ratio;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.8);
};

const handleRename = (image) => {
  const newName = prompt('请输入新名称:', image.name);
  if (newName && newName !== image.name) {
    imageAssetsStore.renameImage(image.id, newName);
  }
};

const handlePreview = (image) => {
  previewImage.value = image;
};

const closePreview = () => {
  previewImage.value = null;
};

const handleDelete = (image) => {
  if (confirm(`确定要删除图片 "${image.name}" 吗？`)) {
    imageAssetsStore.removeImage(image.id);
  }
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};
</script>

<style scoped>
.image-assets-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: var(--primary-hover);
}

.btn-upload .icon {
  font-size: 14px;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.view-toggle {
  display: flex;
  gap: 4px;
}

.view-btn {
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 上传区域 */
.upload-area {
  margin: 12px;
  padding: 24px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.upload-hint {
  text-align: center;
  color: var(--text-secondary);
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.upload-hint p {
  margin: 4px 0;
  font-size: 13px;
}

.upload-tips {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 图片容器 */
.images-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 空状态 */
.empty-state {
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
  margin: 0;
  font-size: 14px;
}

/* 网格视图 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.image-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-card.selected {
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

.image-info {
  padding: 8px;
}

.image-name {
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.image-meta {
  font-size: 11px;
  color: var(--text-tertiary);
}

.image-actions {
  display: flex;
  gap: 4px;
  padding: 0 8px 8px;
}

.action-btn {
  flex: 1;
  padding: 4px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-hover);
}

.action-btn.delete:hover {
  background: #f56c6c;
  color: white;
  border-color: #f56c6c;
}

/* 列表视图 */
.images-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.image-row:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.image-row.selected {
  border-color: var(--primary-color);
  background: var(--primary-color-alpha);
}

.row-thumbnail {
  width: 60px;
  height: 60px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.row-thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.row-info {
  flex: 1;
  min-width: 0;
}

.row-name {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.row-meta {
  font-size: 12px;
  color: var(--text-tertiary);
}

.row-actions {
  display: flex;
  gap: 4px;
}

/* 底部统计 */
.footer-stats {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  font-size: 12px;
  color: var(--text-secondary);
}

/* 预览对话框 */
.preview-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.preview-content {
  background: var(--bg-primary);
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.preview-header h3 {
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

.preview-body {
  flex: 1;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.preview-body img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-footer {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}
</style>

