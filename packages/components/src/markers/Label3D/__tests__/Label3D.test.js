/**
 * Label3D 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Label3D } from '../Label3D.js';

describe('Label3D', () => {
    let mockScene;
    let label3D;

    beforeEach(() => {
        // 模拟场景对象
        mockScene = {
            scene: {
                add: vi.fn()
            },
            camera: {
                instance: {}
            }
        };

        // 创建 Label3D 实例
        label3D = new Label3D(mockScene, {
            name: 'test-labels',
            globalConfig: {
                fontSize: 32,
                textColor: '#ffffff'
            }
        });
    });

    it('should create instance with default config', () => {
        expect(label3D).toBeDefined();
        expect(label3D.name).toBe('test-labels');
        expect(label3D.labelSprites).toBeDefined();
        expect(label3D.labelDataMap).toBeDefined();
    });

    it('should have correct global config', () => {
        expect(label3D.config.globalConfig.fontSize).toBe(32);
        expect(label3D.config.globalConfig.textColor).toBe('#ffffff');
    });

    it('should create label sprite', async () => {
        const labelData = {
            id: 'label1',
            label: 'Test Label',
            position: { x: 0, y: 0, z: 0 }
        };

        await label3D.onMounted();
        await label3D.createLabel(labelData);

        expect(label3D.labelSprites.has('label1')).toBe(true);
        expect(label3D.labelDataMap.has('label1')).toBe(true);
    });

    it('should get label by id', async () => {
        const labelData = {
            id: 'label1',
            label: 'Test Label',
            position: { x: 0, y: 0, z: 0 }
        };

        await label3D.onMounted();
        await label3D.createLabel(labelData);

        const label = label3D.getLabel('label1');
        expect(label).toBeDefined();
        expect(label.id).toBe('label1');
        expect(label.label).toBe('Test Label');
    });

    it('should remove label', async () => {
        const labelData = {
            id: 'label1',
            label: 'Test Label',
            position: { x: 0, y: 0, z: 0 }
        };

        await label3D.onMounted();
        await label3D.createLabel(labelData);
        
        expect(label3D.labelSprites.has('label1')).toBe(true);
        
        label3D.removeLabel('label1');
        
        expect(label3D.labelSprites.has('label1')).toBe(false);
        expect(label3D.labelDataMap.has('label1')).toBe(false);
    });

    it('should get all labels', async () => {
        await label3D.onMounted();
        await label3D.createLabel({
            id: 'label1',
            label: 'Label 1',
            position: { x: 0, y: 0, z: 0 }
        });
        await label3D.createLabel({
            id: 'label2',
            label: 'Label 2',
            position: { x: 1, y: 1, z: 1 }
        });

        const allLabels = label3D.getAllLabels();
        expect(allLabels.length).toBe(2);
    });

    it('should clear all labels', async () => {
        await label3D.onMounted();
        await label3D.createLabel({
            id: 'label1',
            label: 'Label 1',
            position: { x: 0, y: 0, z: 0 }
        });
        await label3D.createLabel({
            id: 'label2',
            label: 'Label 2',
            position: { x: 1, y: 1, z: 1 }
        });

        expect(label3D.labelSprites.size).toBe(2);
        
        label3D.clearLabels();
        
        expect(label3D.labelSprites.size).toBe(0);
        expect(label3D.labelDataMap.size).toBe(0);
    });

    it('should show and hide label', async () => {
        await label3D.onMounted();
        await label3D.createLabel({
            id: 'label1',
            label: 'Label 1',
            position: { x: 0, y: 0, z: 0 }
        });

        const sprite = label3D.labelSprites.get('label1');
        expect(sprite.visible).toBe(true);

        label3D.hideLabel('label1');
        expect(sprite.visible).toBe(false);

        label3D.showLabel('label1');
        expect(sprite.visible).toBe(true);
    });

    it('should return interactive objects', async () => {
        await label3D.onMounted();
        await label3D.createLabel({
            id: 'label1',
            label: 'Label 1',
            position: { x: 0, y: 0, z: 0 }
        });

        const interactiveObjects = label3D.getInteractiveObjects();
        expect(interactiveObjects.length).toBe(1);
    });
});

