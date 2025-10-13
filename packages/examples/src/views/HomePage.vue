<template>
    <div class="home-page">
        <div class="home-container">
            <!-- 标题 -->
            <div class="home-header">
                <h1 class="title">Mogl SDK Examples</h1>
                <p class="subtitle">探索 WebGL 3D 渲染的无限可能</p>
                <p class="version">Vue 3 + Vite + Three.js</p>
            </div>

            <!-- 示例卡片网格 -->
            <div class="examples-grid">
                <div
                    v-for="example in examples"
                    :key="example.id"
                    class="example-card"
                    @click="navigateToExample(example)"
                >
                    <div class="card-icon">{{ example.icon }}</div>
                    <h3 class="card-title">{{ example.title }}</h3>
                    <p class="card-description">{{ example.description }}</p>
                    <div class="card-footer">
                        <span class="card-badge" :class="`badge-${example.category}`">
                            {{ getCategoryLabel(example.category) }}
                        </span>
                        <span class="card-arrow">→</span>
                    </div>
                </div>
            </div>

            <!-- 页脚 -->
            <div class="home-footer">
                <p class="footer-note">需要增加的案例请或者功能请联系</p>
                <div class="footer-contact">
                    <span>联系方式：</span>
                    <a href="mailto:stoneraoy@gmail.com" class="contact-email"
                        >stoneraoy@gmail.com</a
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const examples = ref([
    {
        id: 1,
        title: '01 - Hello World',
        description: '基础场景创建和初始化',
        icon: '🎯',
        category: 'basic',
        route: '/examples/01-hello-world'
    },
    {
        id: 2,
        title: '02 - Camera Controls',
        description: '相机控制和交互',
        icon: '📷',
        category: 'basic',
        route: '/examples/02-camera-controls'
    },
    {
        id: 3,
        title: '03 - Lighting',
        description: '灯光系统和阴影',
        icon: '💡',
        category: 'basic',
        route: '/examples/03-lighting'
    },
    {
        id: 4,
        title: '04 - Model Loader',
        description: 'GLTF/GLB 模型加载',
        icon: '🎭',
        category: 'advanced',
        route: '/examples/04-model-loader'
    },
    {
        id: 5,
        title: '05 - Animations',
        description: '路径动画和模型动画',
        icon: '🎬',
        category: 'advanced',
        route: '/examples/05-animations'
    },
    {
        id: 6,
        title: '06 - Particle System',
        description: '粒子系统和特效',
        icon: '✨',
        category: 'expert',
        route: '/examples/06-particle-system'
    },
    {
        id: 7,
        title: '07 - Advanced Model Loader',
        description: '高级模型加载、HDR 环境贴图和 Mesh 操作',
        icon: '🏗️',
        category: 'expert',
        route: '/examples/07-advanced-model-loader'
    },
    {
        id: 8,
        title: '08 - Model Bake Lighting',
        description: '模型烘焙光照效果展示',
        icon: '🏭',
        category: 'expert',
        route: '/examples/08-henglaji-baked-lighting'
    },
    {
        id: 9,
        title: '09 - Label3D',
        description: '三维标签组件 - Canvas 文字纹理和事件交互',
        icon: '🏷️',
        category: 'advanced',
        route: '/examples/09-label3d'
    },
    {
        id: 10,
        title: '10 - Migration Line',
        description: '迁移线动画组件 - Shader/Particle/Line2 三种渲染方式',
        icon: '🌊',
        category: 'advanced',
        route: '/examples/10-migration-line'
    }
]);

const getCategoryLabel = (category) => {
    const labels = {
        basic: '基础',
        advanced: '进阶',
        expert: '高级'
    };
    return labels[category] || category;
};

const navigateToExample = (example) => {
    router.push(example.route);
};
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

.home-container {
    width: 100%;
    max-width: 1600px;
}

.home-header {
    text-align: center;
    margin-bottom: 60px;
    color: white;
}

.title {
    font-size: 56px;
    font-weight: bold;
    margin-bottom: 16px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
    font-size: 22px;
    opacity: 0.95;
    margin-bottom: 8px;
}

.version {
    font-size: 16px;
    opacity: 0.8;
}

.examples-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    margin-bottom: 60px;
    justify-content: center;
}

.example-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    flex: 0 0 auto;
    width: 300px;
    min-width: 200px;
    max-width: 350px;
}

.example-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.example-card:hover::before {
    transform: scaleX(1);
}

.example-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-icon {
    font-size: 56px;
    margin-bottom: 20px;
}

.card-title {
    font-size: 24px;
    margin-bottom: 12px;
    color: #333;
    font-weight: 600;
}

.card-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 15px;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: white;
}

.badge-basic {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.badge-advanced {
    background: linear-gradient(135deg, #f093fb, #f5576c);
}

.badge-expert {
    background: linear-gradient(135deg, #fa709a, #fee140);
}

.card-arrow {
    font-size: 24px;
    color: var(--primary-color);
    transition: transform 0.3s ease;
}

.example-card:hover .card-arrow {
    transform: translateX(5px);
}

.home-footer {
    text-align: center;
    color: white;
    opacity: 0.9;
    font-size: 14px;
}

.footer-note {
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.7;
}

.footer-contact {
    margin-top: 12px;
    font-size: 14px;
    opacity: 0.9;
}

.contact-email {
    color: #fff;
    text-decoration: none;
    margin-left: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.contact-email:hover {
    background: rgba(255, 255, 255, 0.2);
    text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
    .title {
        font-size: 36px;
    }

    .subtitle {
        font-size: 18px;
    }

    .version {
        font-size: 14px;
    }

    .examples-grid {
        flex-direction: column;
        gap: 20px;
    }

    .example-card {
        padding: 24px;
        width: 100%;
        min-width: unset;
        max-width: unset;
        flex: none;
    }

    .card-icon {
        font-size: 48px;
    }

    .card-title {
        font-size: 20px;
    }
}
</style>

