/**
 * NodeProperties 节点属性系统
 * 
 * @description 定义节点属性配置结构、验证机制和属性编辑器类型
 */

/**
 * 属性类型枚举
 */
export const PropertyType = {
    NUMBER: 'number',
    STRING: 'string',
    BOOLEAN: 'boolean',
    COLOR: 'color',
    SELECT: 'select',
    SLIDER: 'slider',
    TEXTAREA: 'textarea',
    IMAGE: 'image',
    DATA_SOURCE: 'dataSource'
};

/**
 * 属性定义类
 */
export class PropertyDefinition {
    /**
     * 创建属性定义
     * 
     * @param {Object} config - 属性配置
     * @param {string} config.key - 属性键名
     * @param {string} config.label - 属性显示名称
     * @param {string} config.type - 属性类型
     * @param {*} config.defaultValue - 默认值
     * @param {string} config.category - 属性分类
     * @param {Object} config.options - 额外选项
     */
    constructor(config) {
        this.key = config.key;
        this.label = config.label || config.key;
        this.type = config.type || PropertyType.STRING;
        this.defaultValue = config.defaultValue;
        this.category = config.category || 'basic';
        this.description = config.description || '';
        this.options = config.options || {};
        
        // 验证规则
        this.min = config.min;
        this.max = config.max;
        this.step = config.step;
        this.required = config.required || false;
        this.readonly = config.readonly || false;
        this.choices = config.choices || [];
    }

    /**
     * 验证属性值
     * 
     * @param {*} value - 属性值
     * @returns {Object} 验证结果 { valid: boolean, error: string }
     */
    validate(value) {
        // 必填验证
        if (this.required && (value === null || value === undefined || value === '')) {
            return { valid: false, error: `${this.label} is required` };
        }

        // 类型验证
        switch (this.type) {
            case PropertyType.NUMBER:
            case PropertyType.SLIDER:
                return this.validateNumber(value);
            
            case PropertyType.STRING:
            case PropertyType.TEXTAREA:
                return this.validateString(value);
            
            case PropertyType.BOOLEAN:
                return this.validateBoolean(value);
            
            case PropertyType.COLOR:
                return this.validateColor(value);
            
            case PropertyType.SELECT:
                return this.validateSelect(value);
            
            default:
                return { valid: true };
        }
    }

    /**
     * 验证数字
     */
    validateNumber(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            return { valid: false, error: `${this.label} must be a number` };
        }

        if (this.min !== undefined && value < this.min) {
            return { valid: false, error: `${this.label} must be >= ${this.min}` };
        }

        if (this.max !== undefined && value > this.max) {
            return { valid: false, error: `${this.label} must be <= ${this.max}` };
        }

        return { valid: true };
    }

    /**
     * 验证字符串
     */
    validateString(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: `${this.label} must be a string` };
        }

        if (this.min !== undefined && value.length < this.min) {
            return { valid: false, error: `${this.label} must be at least ${this.min} characters` };
        }

        if (this.max !== undefined && value.length > this.max) {
            return { valid: false, error: `${this.label} must be at most ${this.max} characters` };
        }

        return { valid: true };
    }

    /**
     * 验证布尔值
     */
    validateBoolean(value) {
        if (typeof value !== 'boolean') {
            return { valid: false, error: `${this.label} must be a boolean` };
        }
        return { valid: true };
    }

    /**
     * 验证颜色
     */
    validateColor(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: `${this.label} must be a string` };
        }

        // 简单的颜色格式验证
        const colorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
        if (!colorRegex.test(value)) {
            return { valid: false, error: `${this.label} must be a valid hex color` };
        }

        return { valid: true };
    }

    /**
     * 验证选择
     */
    validateSelect(value) {
        if (this.choices.length > 0 && !this.choices.includes(value)) {
            return { valid: false, error: `${this.label} must be one of: ${this.choices.join(', ')}` };
        }
        return { valid: true };
    }
}

/**
 * 节点属性配置
 */
export const NodePropertyConfigs = {
    /**
     * 基础属性
     */
    basic: [
        new PropertyDefinition({
            key: 'x',
            label: 'X 坐标',
            type: PropertyType.NUMBER,
            defaultValue: 0,
            category: 'basic',
            description: '节点的 X 坐标位置'
        }),
        new PropertyDefinition({
            key: 'y',
            label: 'Y 坐标',
            type: PropertyType.NUMBER,
            defaultValue: 0,
            category: 'basic',
            description: '节点的 Y 坐标位置'
        }),
        new PropertyDefinition({
            key: 'rotation',
            label: '旋转角度',
            type: PropertyType.SLIDER,
            defaultValue: 0,
            min: 0,
            max: 360,
            step: 1,
            category: 'basic',
            description: '节点的旋转角度（度）'
        }),
        new PropertyDefinition({
            key: 'scaleX',
            label: 'X 缩放',
            type: PropertyType.SLIDER,
            defaultValue: 1,
            min: 0.1,
            max: 5,
            step: 0.1,
            category: 'basic',
            description: '节点的 X 轴缩放'
        }),
        new PropertyDefinition({
            key: 'scaleY',
            label: 'Y 缩放',
            type: PropertyType.SLIDER,
            defaultValue: 1,
            min: 0.1,
            max: 5,
            step: 0.1,
            category: 'basic',
            description: '节点的 Y 轴缩放'
        }),
        new PropertyDefinition({
            key: 'visible',
            label: '可见',
            type: PropertyType.BOOLEAN,
            defaultValue: true,
            category: 'basic',
            description: '节点是否可见'
        }),
        new PropertyDefinition({
            key: 'locked',
            label: '锁定',
            type: PropertyType.BOOLEAN,
            defaultValue: false,
            category: 'basic',
            description: '节点是否锁定（锁定后不可编辑）'
        })
    ],

    /**
     * 样式属性
     */
    style: [
        new PropertyDefinition({
            key: 'color',
            label: '颜色',
            type: PropertyType.COLOR,
            defaultValue: '#409EFF',
            category: 'style',
            description: '节点的填充颜色'
        }),
        new PropertyDefinition({
            key: 'opacity',
            label: '透明度',
            type: PropertyType.SLIDER,
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.01,
            category: 'style',
            description: '节点的透明度'
        }),
        new PropertyDefinition({
            key: 'borderColor',
            label: '边框颜色',
            type: PropertyType.COLOR,
            defaultValue: '#ffffff',
            category: 'style',
            description: '节点的边框颜色'
        }),
        new PropertyDefinition({
            key: 'borderWidth',
            label: '边框宽度',
            type: PropertyType.NUMBER,
            defaultValue: 0,
            min: 0,
            max: 20,
            step: 1,
            category: 'style',
            description: '节点的边框宽度'
        })
    ],

    /**
     * 矩形特有属性
     */
    rect: [
        new PropertyDefinition({
            key: 'width',
            label: '宽度',
            type: PropertyType.NUMBER,
            defaultValue: 100,
            min: 1,
            max: 1000,
            category: 'rect',
            description: '矩形的宽度'
        }),
        new PropertyDefinition({
            key: 'height',
            label: '高度',
            type: PropertyType.NUMBER,
            defaultValue: 100,
            min: 1,
            max: 1000,
            category: 'rect',
            description: '矩形的高度'
        }),
        new PropertyDefinition({
            key: 'borderRadius',
            label: '圆角半径',
            type: PropertyType.NUMBER,
            defaultValue: 0,
            min: 0,
            max: 100,
            category: 'rect',
            description: '矩形的圆角半径'
        })
    ],

    /**
     * 圆形特有属性
     */
    circle: [
        new PropertyDefinition({
            key: 'radius',
            label: '半径',
            type: PropertyType.NUMBER,
            defaultValue: 50,
            min: 1,
            max: 500,
            category: 'circle',
            description: '圆形的半径'
        }),
        new PropertyDefinition({
            key: 'startAngle',
            label: '起始角度',
            type: PropertyType.SLIDER,
            defaultValue: 0,
            min: 0,
            max: 360,
            step: 1,
            category: 'circle',
            description: '圆弧的起始角度'
        }),
        new PropertyDefinition({
            key: 'endAngle',
            label: '结束角度',
            type: PropertyType.SLIDER,
            defaultValue: 360,
            min: 0,
            max: 360,
            step: 1,
            category: 'circle',
            description: '圆弧的结束角度'
        })
    ],

    /**
     * 文本特有属性
     */
    text: [
        new PropertyDefinition({
            key: 'text',
            label: '文本内容',
            type: PropertyType.TEXTAREA,
            defaultValue: 'Text',
            category: 'text',
            description: '文本节点的内容'
        }),
        new PropertyDefinition({
            key: 'fontSize',
            label: '字体大小',
            type: PropertyType.NUMBER,
            defaultValue: 24,
            min: 8,
            max: 200,
            category: 'text',
            description: '文本的字体大小'
        }),
        new PropertyDefinition({
            key: 'fontFamily',
            label: '字体',
            type: PropertyType.SELECT,
            defaultValue: 'Arial, sans-serif',
            choices: ['Arial, sans-serif', 'Times New Roman, serif', 'Courier New, monospace', 'Microsoft YaHei, sans-serif'],
            category: 'text',
            description: '文本的字体'
        }),
        new PropertyDefinition({
            key: 'fontWeight',
            label: '字重',
            type: PropertyType.SELECT,
            defaultValue: 'normal',
            choices: ['normal', 'bold', 'lighter', 'bolder'],
            category: 'text',
            description: '文本的字重'
        })
    ],

    /**
     * 图片特有属性
     */
    image: [
        new PropertyDefinition({
            key: 'imageUrl',
            label: '图片 URL',
            type: PropertyType.IMAGE,
            defaultValue: '',
            category: 'image',
            description: '图片的 URL 地址'
        }),
        new PropertyDefinition({
            key: 'width',
            label: '宽度',
            type: PropertyType.NUMBER,
            defaultValue: 200,
            min: 1,
            max: 1000,
            category: 'image',
            description: '图片的宽度'
        }),
        new PropertyDefinition({
            key: 'height',
            label: '高度',
            type: PropertyType.NUMBER,
            defaultValue: 150,
            min: 1,
            max: 1000,
            category: 'image',
            description: '图片的高度'
        }),
        new PropertyDefinition({
            key: 'fit',
            label: '适应方式',
            type: PropertyType.SELECT,
            defaultValue: 'contain',
            choices: ['contain', 'cover', 'fill', 'none'],
            category: 'image',
            description: '图片的适应方式'
        })
    ]
};

/**
 * 获取节点类型的属性配置
 * 
 * @param {string} nodeType - 节点类型
 * @returns {Array<PropertyDefinition>} 属性定义数组
 */
export function getNodePropertyConfigs(nodeType) {
    const configs = [
        ...NodePropertyConfigs.basic,
        ...NodePropertyConfigs.style
    ];

    // 添加节点类型特有的属性
    if (NodePropertyConfigs[nodeType]) {
        configs.push(...NodePropertyConfigs[nodeType]);
    }

    return configs;
}

/**
 * 验证节点属性
 * 
 * @param {string} nodeType - 节点类型
 * @param {Object} properties - 属性对象
 * @returns {Object} 验证结果 { valid: boolean, errors: Array }
 */
export function validateNodeProperties(nodeType, properties) {
    const configs = getNodePropertyConfigs(nodeType);
    const errors = [];

    configs.forEach(config => {
        const value = properties[config.key];
        const result = config.validate(value);
        if (!result.valid) {
            errors.push({
                key: config.key,
                error: result.error
            });
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

