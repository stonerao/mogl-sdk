/**
 * 图片资源状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useImageAssetsStore = defineStore('imageAssets', () => {
  // ========== 状态 ==========
  
  /**
   * 图片资源列表
   * @type {Array<{
   *   id: string,
   *   name: string,
   *   url: string,
   *   width: number,
   *   height: number,
   *   size: number,
   *   type: string,
   *   uploadTime: number,
   *   thumbnail: string
   * }>}
   */
  const images = ref([]);
  
  /**
   * 选中的图片 ID
   */
  const selectedImageId = ref(null);
  
  /**
   * 搜索关键词
   */
  const searchQuery = ref('');
  
  /**
   * 视图模式：'grid' | 'list'
   */
  const viewMode = ref('grid');
  
  // ========== 计算属性 ==========
  
  /**
   * 选中的图片
   */
  const selectedImage = computed(() => {
    if (!selectedImageId.value) return null;
    return images.value.find(img => img.id === selectedImageId.value);
  });
  
  /**
   * 过滤后的图片列表
   */
  const filteredImages = computed(() => {
    if (!searchQuery.value) {
      return images.value;
    }
    
    const query = searchQuery.value.toLowerCase();
    return images.value.filter(img => 
      img.name.toLowerCase().includes(query)
    );
  });
  
  /**
   * 统计信息
   */
  const stats = computed(() => {
    const totalSize = images.value.reduce((sum, img) => sum + img.size, 0);
    return {
      count: images.value.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  });
  
  // ========== 方法 ==========
  
  /**
   * 生成唯一 ID
   */
  const generateId = () => {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * 添加图片
   * @param {Object} imageData - 图片数据
   * @returns {Object} 添加的图片对象
   */
  const addImage = (imageData) => {
    const image = {
      id: generateId(),
      name: imageData.name,
      url: imageData.url,
      width: imageData.width,
      height: imageData.height,
      size: imageData.size,
      type: imageData.type,
      uploadTime: Date.now(),
      thumbnail: imageData.thumbnail || imageData.url
    };
    
    images.value.push(image);
    console.log('图片已添加:', image);
    return image;
  };
  
  /**
   * 删除图片
   * @param {string} imageId - 图片 ID
   */
  const removeImage = (imageId) => {
    const index = images.value.findIndex(img => img.id === imageId);
    if (index !== -1) {
      const removed = images.value.splice(index, 1)[0];
      console.log('图片已删除:', removed);
      
      // 如果删除的是选中的图片，清除选中状态
      if (selectedImageId.value === imageId) {
        selectedImageId.value = null;
      }
      
      return removed;
    }
    return null;
  };
  
  /**
   * 更新图片信息
   * @param {string} imageId - 图片 ID
   * @param {Object} updates - 更新的数据
   */
  const updateImage = (imageId, updates) => {
    const image = images.value.find(img => img.id === imageId);
    if (image) {
      Object.assign(image, updates);
      console.log('图片已更新:', image);
      return image;
    }
    return null;
  };
  
  /**
   * 重命名图片
   * @param {string} imageId - 图片 ID
   * @param {string} newName - 新名称
   */
  const renameImage = (imageId, newName) => {
    return updateImage(imageId, { name: newName });
  };
  
  /**
   * 选中图片
   * @param {string} imageId - 图片 ID
   */
  const selectImage = (imageId) => {
    selectedImageId.value = imageId;
  };
  
  /**
   * 清除选中
   */
  const clearSelection = () => {
    selectedImageId.value = null;
  };
  
  /**
   * 设置搜索关键词
   * @param {string} query - 搜索关键词
   */
  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };
  
  /**
   * 设置视图模式
   * @param {string} mode - 视图模式 'grid' | 'list'
   */
  const setViewMode = (mode) => {
    viewMode.value = mode;
  };
  
  /**
   * 根据 ID 获取图片
   * @param {string} imageId - 图片 ID
   * @returns {Object|null} 图片对象
   */
  const getImageById = (imageId) => {
    return images.value.find(img => img.id === imageId) || null;
  };
  
  /**
   * 检查图片是否被使用
   * @param {string} imageId - 图片 ID
   * @returns {Array} 使用该图片的节点列表
   */
  const getImageUsage = (imageId) => {
    // TODO: 实现检查图片使用情况的逻辑
    // 需要遍历所有节点，检查是否有节点使用了该图片
    return [];
  };
  
  /**
   * 清空所有图片
   */
  const clearAll = () => {
    images.value = [];
    selectedImageId.value = null;
    searchQuery.value = '';
  };
  
  /**
   * 序列化为 JSON
   * @returns {Object} 序列化后的数据
   */
  const toJSON = () => {
    return {
      images: images.value.map(img => ({
        id: img.id,
        name: img.name,
        url: img.url,
        width: img.width,
        height: img.height,
        size: img.size,
        type: img.type,
        uploadTime: img.uploadTime,
        thumbnail: img.thumbnail
      }))
    };
  };
  
  /**
   * 从 JSON 加载
   * @param {Object} data - JSON 数据
   */
  const fromJSON = (data) => {
    if (data && data.images) {
      images.value = data.images;
      console.log(`已加载 ${images.value.length} 张图片资源`);
    }
  };
  
  /**
   * 批量添加图片
   * @param {Array} imageDataList - 图片数据列表
   */
  const addImages = (imageDataList) => {
    const addedImages = imageDataList.map(imageData => addImage(imageData));
    return addedImages;
  };
  
  // ========== 返回 ==========
  
  return {
    // 状态
    images,
    selectedImageId,
    searchQuery,
    viewMode,
    
    // 计算属性
    selectedImage,
    filteredImages,
    stats,
    
    // 方法
    addImage,
    addImages,
    removeImage,
    updateImage,
    renameImage,
    selectImage,
    clearSelection,
    setSearchQuery,
    setViewMode,
    getImageById,
    getImageUsage,
    clearAll,
    toJSON,
    fromJSON
  };
});

