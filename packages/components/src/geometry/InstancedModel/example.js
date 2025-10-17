import { InstancedModel } from './InstancedModel.js';
import * as THREE from 'three';

async function example() {
    const instancedModel = new InstancedModel({
        url: '/models/ShaderBall.glb',
        count: 2000,
        dynamicUpdate: true
    });

    await instancedModel.load((progress) => {
        if (progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`加载进度: ${percent.toFixed(2)}%`);
        }
    });

    const data = [];
    const palette = [0xf20587, 0xf2d479, 0xf2c879, 0xf2b077, 0xf24405];

    for (let i = 0; i < 2000; i++) {
        data.push({
            position: {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 50,
                z: (Math.random() - 0.5) * 200
            },
            rotation: {
                x: 0,
                y: Math.random() * Math.PI * 2,
                z: 0
            },
            scale: 0.5 + Math.random() * 1.5,
            color: palette[Math.floor(Math.random() * palette.length)]
        });
    }

    const instancedMesh = instancedModel.createInstances(2000, data);

    return { instancedModel, instancedMesh, data };
}

async function gridExample() {
    const instancedModel = new InstancedModel({
        url: '/models/ShaderBall.glb',
        count: 100
    });

    await instancedModel.load();

    const data = [];
    const gridSize = 10;

    for (let i = 0; i < 100; i++) {
        const col = i % gridSize;
        const row = Math.floor(i / gridSize);

        data.push({
            position: {
                x: (col - gridSize / 2) * 10,
                y: 0,
                z: (row - gridSize / 2) * 10
            },
            rotation: { x: 0, y: 0, z: 0 },
            scale: 1,
            color: 0x00ff00
        });
    }

    const instancedMesh = instancedModel.createInstances(100, data);

    return { instancedModel, instancedMesh, data };
}

async function animationExample(scene) {
    const instancedModel = new InstancedModel({
        url: '/models/ShaderBall.glb',
        count: 500
    });

    await instancedModel.load();

    const data = [];
    const ages = new Float32Array(500);
    const scales = new Float32Array(500);

    const easeOutCubic = (t) => --t * t * t + 1;
    const scaleCurve = (t) => Math.abs(easeOutCubic((t > 0.5 ? 1 - t : t) * 2));

    for (let i = 0; i < 500; i++) {
        ages[i] = Math.random();
        scales[i] = scaleCurve(ages[i]);

        data.push({
            position: {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 50,
                z: (Math.random() - 0.5) * 100
            },
            rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
            scale: scales[i],
            color: 0xffffff
        });
    }

    const instancedMesh = instancedModel.createInstances(500, data);
    scene.add(instancedMesh);

    function animate() {
        for (let i = 0; i < 500; i++) {
            ages[i] += 0.005;

            if (ages[i] >= 1) {
                ages[i] = 0.001;
            }

            const prevScale = scales[i];
            scales[i] = scaleCurve(ages[i]);
            const scaleRatio = scales[i] / prevScale;

            data[i].scale = {
                x: data[i].scale * scaleRatio,
                y: data[i].scale * scaleRatio,
                z: data[i].scale * scaleRatio
            };
        }

        instancedModel.updateInstances(instancedMesh, data);
    }

    return { instancedModel, instancedMesh, animate };
}

export { example, gridExample, animationExample };
