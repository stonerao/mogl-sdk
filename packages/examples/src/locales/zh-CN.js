export default {
    common: {
        home: '首页',
        back: '返回',
        language: '语言',
        chinese: '中文',
        english: 'English'
    },
    home: {
        title: 'W3D SDK 示例集合',
        subtitle: '探索 W3D SDK 的强大功能',
        description: '通过这些交互式示例学习如何使用 W3D SDK 构建令人惊叹的 3D 应用',
        categories: {
            all: '全部',
            basic: '基础',
            advanced: '高级',
            effects: '特效',
            geometry: '几何体'
        },
        examples: {
            '01-hello-world': {
                title: '01 - Hello World',
                description: '最简单的 W3D 场景 - 创建第一个 3D 应用'
            },
            '02-camera-controls': {
                title: '02 - Camera Controls',
                description: '相机控制 - 轨道控制器和相机动画'
            },
            '03-lighting': {
                title: '03 - Lighting',
                description: '光照系统 - 环境光、平行光、点光源'
            },
            '04-model-loader': {
                title: '04 - Model Loader',
                description: '模型加载器 - 加载和显示 3D 模型'
            },
            '05-animations': {
                title: '05 - Animations',
                description: '动画系统 - 模型动画和路径动画'
            },
            '06-particle-system': {
                title: '06 - Particle System',
                description: '粒子系统 - 创建粒子特效'
            },
            '07-advanced-model-loader': {
                title: '07 - Advanced Model Loader',
                description: '高级模型加载 - 多模型管理和交互'
            },
            '08-model-bake': {
                title: '08 - Model Bake',
                description: '模型烘焙 - 烘焙光照和阴影'
            },
            '09-label-3d': {
                title: '09 - Label 3D',
                description: '三维标签组件 - Canvas 文字纹理和事件交互'
            },
            '10-migration-line': {
                title: '10 - Migration Line',
                description: '迁移线动画组件 - Shader/Particle/Line2 三种渲染方式'
            },
            '11-area-block': {
                title: '11 - Area Block',
                description: '独立区域块组件 - 云雾 Shader 效果、墙壁底部渲染'
            },
            '12-image-marker': {
                title: '12 - Image Marker',
                description: '独立图片点位组件 - Sprite/Plane 渲染、多状态切换、鼠标交互'
            },
            '13-pipeline': {
                title: '13 - Pipeline',
                description: '管道效果组件 - 路径管道生成、进度控制、流光效果'
            },
            '14-bvh-query': {
                title: '14 - BVH Query',
                description: 'BVH 空间查询 - 高性能射线投射和碰撞检测'
            },
            '15-extruded-polygon': {
                title: '15 - Extruded Polygon',
                description: '拉伸多边形组件 - 点位生成多边形、垂直拉伸、颜色渐变、纹理贴图'
            },
            '16-instanced-model': {
                title: '16 - Instanced Model',
                description: '实例化模型组件 - 大规模模型实例化和管理'
            },
            '17-shader-material': {
                title: '17 - Shader Material',
                description: '着色器材质组件 - 自定义着色器材质管理和应用'
            }
        }
    },
    controls: {
        config: '配置',
        basic: '基础配置',
        advanced: '高级配置',
        effects: '特效配置',
        performance: '性能统计',
        eventLog: '事件日志',
        add: '添加',
        remove: '删除',
        clear: '清除',
        clearAll: '清除所有',
        update: '更新',
        toggle: '切换',
        show: '显示',
        hide: '隐藏',
        enable: '启用',
        disable: '禁用',
        play: '播放',
        pause: '暂停',
        stop: '停止',
        reset: '重置',
        animate: '动画',
        move: '移动'
    },
    stats: {
        title: '性能统计',
        fps: 'FPS',
        count: '数量',
        vertices: '顶点数',
        triangles: '三角形数',
        drawCalls: '绘制调用'
    },
    params: {
        position: '位置',
        rotation: '旋转',
        scale: '缩放',
        color: '颜色',
        opacity: '透明度',
        size: '大小',
        width: '宽度',
        height: '高度',
        radius: '半径',
        length: '长度',
        speed: '速度',
        intensity: '强度',
        progress: '进度',
        offset: '偏移',
        segments: '分段数',
        type: '类型',
        state: '状态',
        visible: '可见',
        enabled: '启用'
    },
    pipeline: {
        title: '管道效果控制',
        config: '管道配置',
        radius: '管道半径',
        color: '管道颜色',
        opacity: '透明度',
        segments: '分段数',
        progress: '显示进度',
        addPipeline: '添加管道',
        clearAll: '清除所有管道',
        flow: {
            title: '流光效果',
            enabled: '启用流光效果',
            speed: '流光速度',
            color: '流光颜色',
            width: '流光宽度',
            intensity: '流光强度'
        },
        list: '管道列表',
        animate: '动画',
        remove: '删除'
    },
    imageMarker: {
        title: '图片点位控制',
        config: '点位配置',
        type: '渲染类型',
        size: '图片大小',
        color: '颜色叠加',
        opacity: '透明度',
        offset: '位置偏移',
        sizeAttenuation: '大小随距离衰减',
        showLabel: '显示文字标签',
        labelText: '标签文字',
        labelOffset: '标签偏移',
        addMarker: '添加点位',
        clearAll: '清除所有点位',
        list: '点位列表',
        state: '状态',
        toggleState: '切换',
        toggleLabel: '标签',
        move: '移动',
        remove: '删除'
    },
    areaBlock: {
        title: '区域块控制',
        config: '区域块配置',
        color: '区域颜色',
        opacity: '透明度',
        height: '墙壁高度',
        showWall: '显示墙壁',
        showBottom: '显示底部',
        showBorder: '显示边框',
        cloudEffect: '云雾效果',
        cloudSpeed: '云雾速度',
        cloudDensity: '云雾密度',
        addArea: '添加区域',
        clearAll: '清除所有区域',
        list: '区域列表',
        remove: '删除'
    },
    label3d: {
        title: '3D 标签控制',
        config: '标签配置',
        text: '标签文字',
        fontSize: '字体大小',
        textColor: '文字颜色',
        backgroundColor: '背景颜色',
        borderColor: '边框颜色',
        borderWidth: '边框宽度',
        padding: '内边距',
        borderRadius: '圆角半径',
        scale: '缩放',
        addLabel: '添加标签',
        clearAll: '清除所有标签',
        list: '标签列表',
        show: '显示',
        hide: '隐藏',
        remove: '删除'
    },
    migrationLine: {
        title: '迁移线控制',
        config: '迁移线配置',
        type: '渲染类型',
        color: '线条颜色',
        opacity: '透明度',
        width: '线条宽度',
        speed: '动画速度',
        particleSize: '粒子大小',
        particleCount: '粒子数量',
        addLine: '添加迁移线',
        clearAll: '清除所有迁移线',
        list: '迁移线列表',
        play: '播放',
        pause: '暂停',
        remove: '删除'
    },
    bvhQuery: {
        title: 'BVH 空间查询',
        mode: '查询模式',
        modes: {
            raycast: '射线投射',
            nearest: '最近点查询',
            collision: '碰撞检测',
            voxel: '体素化'
        },
        bvhConfig: 'BVH 配置',
        strategy: '构建策略',
        maxDepth: '最大深度',
        maxLeafTris: '叶节点最大三角形数',
        showHelper: '显示 BVH 可视化',
        helperDepth: '可视化深度',
        raycastConfig: '射线投射配置',
        firstHitOnly: '只返回最近交点',
        showNormal: '显示法线',
        nearestConfig: '最近点配置',
        showLine: '显示连线',
        showPoint: '显示点',
        collisionConfig: '碰撞检测配置',
        collisionType: '碰撞类型',
        sphere: '球体',
        box: '包围盒',
        size: '大小',
        nodeCount: '节点数量',
        leafNodeCount: '叶节点数量',
        triangleCount: '三角形数量',
        lastQueryTime: '最后查询时间',
        totalQueries: '总查询次数',
        eventLog: '事件日志',
        raycastHint: '移动鼠标进行射线投射，点击记录交点位置',
        nearestHint: '移动鼠标查看最近点，蓝色球体表示最近点位置',
        collisionHint: '移动鼠标进行碰撞检测，绿色表示未碰撞，红色表示碰撞',
        voxelHint: '体素化功能演示'
    },
    extrudedPolygon: {
        title: '拉伸多边形',
        controls: '拉伸多边形控制',
        presetShapes: '预设形状',
        selectShape: '选择形状',
        rectangle: '矩形',
        pentagon: '五边形',
        hexagon: '六边形',
        star: '星形',
        custom: '自定义',
        extrudeSettings: '拉伸设置',
        height: '拉伸高度',
        colorSettings: '颜色设置',
        bottomColor: '底部颜色',
        topColor: '顶部颜色',
        useGradient: '启用渐变',
        textureSettings: '纹理设置',
        showTexture: '显示纹理',
        textureRepeat: '纹理重复',
        materialSettings: '材质设置',
        opacity: '透明度',
        wireframe: '线框模式',
        stats: '统计信息',
        vertices: '顶点数',
        faces: '面数'
    },
    shaderMaterial: {
        title: '着色器材质控制',
        loading: '加载模型中...',
        materialSelection: '材质选择',
        currentMaterial: '当前材质:',
        activeMaterial: '激活材质:',
        materialParams: '材质参数',
        color1: '颜色 1:',
        color2: '颜色 2:',
        materialList: '材质列表',
        shader: 'Shader',
        materialCount: '材质数量',
        materials: {
            basicColor: '基础颜色',
            gradient: '渐变材质',
            animated: '动画材质'
        }
    }
};
