/**
 * Vue Router 配置
 */

import { createRouter, createWebHistory } from 'vue-router';

// 页面组件
import HomePage from '../views/HomePage.vue';
import NotFound from '../views/NotFound.vue';

// 示例组件（懒加载）
const HelloWorld = () => import('../views/examples/HelloWorld.vue');
const CameraControls = () => import('../views/examples/CameraControls.vue');
const Lighting = () => import('../views/examples/Lighting.vue');
const ModelLoader = () => import('../views/examples/ModelLoader.vue');
const Animations = () => import('../views/examples/Animations.vue');
const ParticleSystem = () => import('../views/examples/ParticleSystem.vue');
const AdvancedModelLoader = () => import('../views/examples/AdvancedModelLoader.vue');
const HenglajiBakedLighting = () => import('../views/examples/ModelBake.vue');
const Label3DDemo = () => import('../views/examples/Label3DDemo.vue');
const MigrationLineDemo = () => import('../views/examples/MigrationLineDemo.vue');
const AreaBlockDemo = () => import('../views/examples/AreaBlockDemo.vue');
const ImageMarkerDemo = () => import('../views/examples/ImageMarkerDemo.vue');
const PipelineDemo = () => import('../views/examples/PipelineDemo.vue');
const BVHQueryDemo = () => import('../views/examples/BVHQueryDemo.vue');
const ExtrudedPolygonDemo = () => import('../views/examples/ExtrudedPolygonDemo.vue');

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
        meta: {
            title: 'Mogl SDK Examples'
        }
    },
    {
        path: '/examples/01-hello-world',
        name: 'HelloWorld',
        component: HelloWorld,
        meta: {
            title: '01 - Hello World',
            category: 'basic'
        }
    },
    {
        path: '/examples/02-camera-controls',
        name: 'CameraControls',
        component: CameraControls,
        meta: {
            title: '02 - Camera Controls',
            category: 'basic'
        }
    },
    {
        path: '/examples/03-lighting',
        name: 'Lighting',
        component: Lighting,
        meta: {
            title: '03 - Lighting',
            category: 'basic'
        }
    },
    {
        path: '/examples/04-model-loader',
        name: 'ModelLoader',
        component: ModelLoader,
        meta: {
            title: '04 - Model Loader',
            category: 'advanced'
        }
    },
    {
        path: '/examples/05-animations',
        name: 'Animations',
        component: Animations,
        meta: {
            title: '05 - Animations',
            category: 'advanced'
        }
    },
    {
        path: '/examples/06-particle-system',
        name: 'ParticleSystem',
        component: ParticleSystem,
        meta: {
            title: '06 - Particle System',
            category: 'expert'
        }
    },
    {
        path: '/examples/07-advanced-model-loader',
        name: 'AdvancedModelLoader',
        component: AdvancedModelLoader,
        meta: {
            title: '07 - Advanced Model Loader',
            category: 'expert'
        }
    },
    {
        path: '/examples/08-henglaji-baked-lighting',
        name: 'HenglajiBakedLighting',
        component: HenglajiBakedLighting,
        meta: {
            title: '08 - 模型烘焙光照',
            category: 'expert'
        }
    },
    {
        path: '/examples/09-label3d',
        name: 'Label3DDemo',
        component: Label3DDemo,
        meta: {
            title: '09 - 三维标签组件',
            category: 'advanced'
        }
    },
    {
        path: '/examples/10-migration-line',
        name: 'MigrationLineDemo',
        component: MigrationLineDemo,
        meta: {
            title: '10 - 迁移线动画组件',
            category: 'advanced'
        }
    },
    {
        path: '/examples/11-area-block',
        name: 'AreaBlockDemo',
        component: AreaBlockDemo,
        meta: {
            title: '11 - 区域块组件',
            category: 'advanced'
        }
    },
    {
        path: '/examples/12-image-marker',
        name: 'ImageMarkerDemo',
        component: ImageMarkerDemo,
        meta: {
            title: '12 - 图片点位组件',
            category: 'advanced'
        }
    },
    {
        path: '/examples/13-pipeline',
        name: 'PipelineDemo',
        component: PipelineDemo,
        meta: {
            title: '13 - Pipeline',
            category: 'effects'
        }
    },
    {
        path: '/examples/14-bvh-query',
        name: 'BVHQueryDemo',
        component: BVHQueryDemo,
        meta: {
            title: '14 - BVH Query',
            category: 'advanced'
        }
    },
    {
        path: '/examples/15-extruded-polygon',
        name: 'ExtrudedPolygonDemo',
        component: ExtrudedPolygonDemo,
        meta: {
            title: '15 - Extruded Polygon',
            category: 'geometry'
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
