/**
 * Vue Router 配置
 */

import { createRouter, createWebHistory } from 'vue-router';

// 页面组件
import IntroPage from '../views/IntroPage.vue';
import ExamplesPage from '../views/ExamplesPage.vue';
import NotFound from '../views/NotFound.vue';

const routes = [
    {
        path: '/',
        name: 'Intro',
        component: IntroPage,
        meta: {
            title: 'Mogl SDK - 快速开发 Three.js 应用'
        }
    },
    {
        path: '/examples',
        name: 'Examples',
        component: ExamplesPage,
        meta: {
            title: 'Mogl SDK 示例集合'
        }
    },
    {
        path: '/examples/01-hello-world',
        name: 'HelloWorld',
        component: () => import('../views/examples/HelloWorld.vue'),
        meta: {
            title: '01 - Hello World',
            category: 'basic'
        }
    },
    {
        path: '/examples/02-camera-controls',
        name: 'CameraControls',
        component: () => import('../views/examples/CameraControls.vue'),
        meta: {
            title: '02 - Camera Controls',
            category: 'basic'
        }
    },
    {
        path: '/examples/03-lighting',
        name: 'Lighting',
        component: () => import('../views/examples/Lighting.vue'),
        meta: {
            title: '03 - Lighting',
            category: 'basic'
        }
    },
    {
        path: '/examples/04-model-loader',
        name: 'ModelLoader',
        component: () => import('../views/examples/ModelLoader.vue'),
        meta: {
            title: '04 - Model Loader',
            category: 'advanced'
        }
    },
    {
        path: '/examples/05-animations',
        name: 'Animations',
        component: () => import('../views/examples/Animations.vue'),
        meta: {
            title: '05 - Animations',
            category: 'advanced'
        }
    },
    {
        path: '/examples/06-particle-system',
        name: 'ParticleSystem',
        component: () => import('../views/examples/ParticleSystem.vue'),
        meta: {
            title: '06 - Particle System',
            category: 'expert'
        }
    },
    {
        path: '/examples/07-advanced-model-loader',
        name: 'AdvancedModelLoader',
        component: () => import('../views/examples/AdvancedModelLoader.vue'),
        meta: {
            title: '07 - Advanced Model Loader',
            category: 'expert'
        }
    },
    {
        path: '/examples/08-model-bake',
        name: 'ModelBake',
        component: () => import('../views/examples/ModelBake.vue'),
        meta: {
            title: '08 - Model Bake',
            category: 'expert'
        }
    },
    {
        path: '/examples/09-label3d',
        name: 'Label3DDemo',
        component: () => import('../views/examples/Label3DDemo.vue'),
        meta: {
            title: '09 - Label 3D',
            category: 'advanced'
        }
    },
    {
        path: '/examples/10-migration-line',
        name: 'MigrationLineDemo',
        component: () => import('../views/examples/MigrationLineDemo.vue'),
        meta: {
            title: '10 - Migration Line',
            category: 'advanced'
        }
    },
    {
        path: '/examples/11-area-block',
        name: 'AreaBlockDemo',
        component: () => import('../views/examples/AreaBlockDemo.vue'),
        meta: {
            title: '11 - Area Block',
            category: 'advanced'
        }
    },
    {
        path: '/examples/12-image-marker',
        name: 'ImageMarkerDemo',
        component: () => import('../views/examples/ImageMarkerDemo.vue'),
        meta: {
            title: '12 - Image Marker',
            category: 'advanced'
        }
    },
    {
        path: '/examples/13-pipeline',
        name: 'PipelineDemo',
        component: () => import('../views/examples/PipelineDemo.vue'),
        meta: {
            title: '13 - Pipeline',
            category: 'effects'
        }
    },
    {
        path: '/examples/14-bvh-query',
        name: 'BVHQueryDemo',
        component: () => import('../views/examples/BVHQueryDemo.vue'),
        meta: {
            title: '14 - BVH Query',
            category: 'advanced'
        }
    },
    {
        path: '/examples/15-extruded-polygon',
        name: 'ExtrudedPolygonDemo',
        component: () => import('../views/examples/ExtrudedPolygonDemo.vue'),
        meta: {
            title: '15 - Extruded Polygon',
            category: 'geometry'
        }
    },
    {
        path: '/examples/16-instanced-model',
        name: 'InstancedModelDemo',
        component: () => import('../views/examples/InstancedModelDemo.vue'),
        meta: {
            title: '16 - Instanced Model',
            category: 'advanced'
        }
    },
    {
        path: '/examples/17-shader-material',
        name: 'ShaderMaterialDemo',
        component: () => import('../views/examples/ShaderMaterialDemo.vue'),
        meta: {
            title: '17 - Shader Material',
            category: 'advanced'
        }
    },
    {
        path: '/examples/18-path-tracer',
        name: 'PathTracerDemo',
        component: () => import('../views/examples/PathTracerDemo.vue'),
        meta: {
            title: '18 - Path Tracer',
            category: 'expert'
        }
    },
    {
        path: '/examples/19-skeletal-animation',
        name: 'SkeletalAnimationDemo',
        component: () => import('../views/examples/SkeletalAnimationDemo.vue'),
        meta: {
            title: '19 - Skeletal Animation',
            category: 'advanced'
        }
    },

    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: {
            title: '404 - 页面未找到'
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫 - 更新页面标题
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Mogl SDK Examples';
    next();
});

export default router;
