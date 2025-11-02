import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAssetStore = defineStore('asset', () => {
    // 资源列表
    const assets = ref([]);

    // 资源分类
    const assetCategories = ['model', 'texture', 'hdr', 'image'];

    // 当前选中的资源分类
    const selectedCategory = ref('model');

    // 搜索关键词
    const searchKeyword = ref('');

    // 资源计数器
    let assetCounter = 0;

    // 根据分类过滤的资源
    const filteredAssets = computed(() => {
        let filtered = assets.value.filter((asset) => asset.category === selectedCategory.value);

        // 搜索过滤
        if (searchKeyword.value) {
            const keyword = searchKeyword.value.toLowerCase();
            filtered = filtered.filter(
                (asset) =>
                    asset.name.toLowerCase().includes(keyword) ||
                    asset.fileName.toLowerCase().includes(keyword)
            );
        }

        return filtered;
    });

    // 根据分类获取资源数量
    const getAssetCountByCategory = (category) => {
        return assets.value.filter((asset) => asset.category === category).length;
    };

    // 添加资源
    const addAsset = (assetData) => {
        const asset = {
            id: `asset_${++assetCounter}`,
            name: assetData.name || `Asset ${assetCounter}`,
            fileName: assetData.fileName || '',
            url: assetData.url || '',
            category: assetData.category || 'model',
            type: assetData.type || '', // 文件类型：glb, gltf, jpg, png, hdr 等
            size: assetData.size || 0, // 文件大小（字节）
            thumbnail: assetData.thumbnail || '', // 缩略图 URL
            metadata: assetData.metadata || {}, // 额外元数据
            createdAt: Date.now()
        };

        assets.value.push(asset);
        return asset;
    };

    // 删除资源
    const removeAsset = (assetId) => {
        const index = assets.value.findIndex((a) => a.id === assetId);
        if (index !== -1) {
            const asset = assets.value[index];
            assets.value.splice(index, 1);
            return asset;
        }
        return null;
    };

    // 更新资源
    const updateAsset = (assetId, updates) => {
        const asset = assets.value.find((a) => a.id === assetId);
        if (asset) {
            Object.assign(asset, updates);
            return asset;
        }
        return null;
    };

    // 根据 ID 获取资源
    const getAssetById = (assetId) => {
        return assets.value.find((a) => a.id === assetId) || null;
    };

    // 根据 URL 获取资源
    const getAssetByUrl = (url) => {
        return assets.value.find((a) => a.url === url) || null;
    };

    // 设置选中的分类
    const setSelectedCategory = (category) => {
        selectedCategory.value = category;
    };

    // 设置搜索关键词
    const setSearchKeyword = (keyword) => {
        searchKeyword.value = keyword;
    };

    // 清空所有资源
    const clearAssets = () => {
        assets.value = [];
        assetCounter = 0;
    };

    // 批量添加资源
    const addAssets = (assetList) => {
        return assetList.map((assetData) => addAsset(assetData));
    };

    // 初始化默认资源
    const initializeDefaultAssets = () => {
        // 添加默认模型资源
        const defaultModels = [
            {
                name: 'ShaderBall',
                fileName: 'ShaderBall.glb',
                url: '/models/ShaderBall.glb',
                category: 'model',
                type: 'glb',
                size: 0,
                thumbnail: ''
            },
            {
                name: 'Xbot',
                fileName: 'Xbot.glb',
                url: '/models/Xbot.glb',
                category: 'model',
                type: 'glb',
                size: 0,
                thumbnail: ''
            },
            {
                name: 'Digital Factory',
                fileName: 'DigitalFactory.glb',
                url: '/models/DigitalFactory.glb',
                category: 'model',
                type: 'glb',
                size: 0,
                thumbnail: ''
            }
        ];

        // 添加默认纹理资源
        const defaultTextures = [
            {
                name: 'Autumn Field',
                fileName: 'autumn_field_puresky_2k.hdr',
                url: '/textures/autumn_field_puresky_2k.hdr',
                category: 'hdr',
                type: 'hdr',
                size: 0,
                thumbnail: ''
            },
            {
                name: 'Blouberg Sunrise',
                fileName: 'blouberg_sunrise_2_1k.hdr',
                url: '/textures/blouberg_sunrise_2_1k.hdr',
                category: 'hdr',
                type: 'hdr',
                size: 0,
                thumbnail: ''
            }
        ];

        addAssets([...defaultModels, ...defaultTextures]);
    };

    return {
        // 状态
        assets,
        assetCategories,
        selectedCategory,
        searchKeyword,
        filteredAssets,

        // 方法
        addAsset,
        removeAsset,
        updateAsset,
        getAssetById,
        getAssetByUrl,
        getAssetCountByCategory,
        setSelectedCategory,
        setSearchKeyword,
        clearAssets,
        addAssets,
        initializeDefaultAssets
    };
});

