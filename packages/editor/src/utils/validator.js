/**
 * 配置数据验证工具
 * 用于验证组件配置、场景配置等数据的有效性
 */

/**
 * 验证规则类型
 */
export const ValidatorTypes = {
    REQUIRED: 'required',
    TYPE: 'type',
    MIN: 'min',
    MAX: 'max',
    PATTERN: 'pattern',
    ENUM: 'enum',
    CUSTOM: 'custom'
};

/**
 * 数据类型
 */
export const DataTypes = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
    OBJECT: 'object',
    FUNCTION: 'function'
};

/**
 * 验证结果
 */
class ValidationResult {
    constructor() {
        this.valid = true;
        this.errors = [];
    }

    addError(field, message) {
        this.valid = false;
        this.errors.push({ field, message });
    }

    getErrors() {
        return this.errors;
    }

    isValid() {
        return this.valid;
    }
}

/**
 * 验证器类
 */
export class Validator {
    /**
     * 验证数据
     * @param {*} data - 要验证的数据
     * @param {Object} schema - 验证规则
     * @returns {ValidationResult} 验证结果
     */
    static validate(data, schema) {
        const result = new ValidationResult();

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // 必填验证
            if (rules.required && (value === undefined || value === null || value === '')) {
                result.addError(field, `${rules.label || field} 是必填项`);
                continue;
            }

            // 如果值为空且非必填，跳过后续验证
            if (value === undefined || value === null || value === '') {
                continue;
            }

            // 类型验证
            if (rules.type) {
                if (!this.validateType(value, rules.type)) {
                    result.addError(field, `${rules.label || field} 类型错误，期望 ${rules.type}`);
                    continue;
                }
            }

            // 最小值验证
            if (rules.min !== undefined) {
                if (typeof value === 'number' && value < rules.min) {
                    result.addError(field, `${rules.label || field} 不能小于 ${rules.min}`);
                }
                if (typeof value === 'string' && value.length < rules.min) {
                    result.addError(field, `${rules.label || field} 长度不能小于 ${rules.min}`);
                }
                if (Array.isArray(value) && value.length < rules.min) {
                    result.addError(field, `${rules.label || field} 数量不能小于 ${rules.min}`);
                }
            }

            // 最大值验证
            if (rules.max !== undefined) {
                if (typeof value === 'number' && value > rules.max) {
                    result.addError(field, `${rules.label || field} 不能大于 ${rules.max}`);
                }
                if (typeof value === 'string' && value.length > rules.max) {
                    result.addError(field, `${rules.label || field} 长度不能大于 ${rules.max}`);
                }
                if (Array.isArray(value) && value.length > rules.max) {
                    result.addError(field, `${rules.label || field} 数量不能大于 ${rules.max}`);
                }
            }

            // 正则验证
            if (rules.pattern && typeof value === 'string') {
                const regex = new RegExp(rules.pattern);
                if (!regex.test(value)) {
                    result.addError(field, `${rules.label || field} 格式不正确`);
                }
            }

            // 枚举验证
            if (rules.enum && Array.isArray(rules.enum)) {
                if (!rules.enum.includes(value)) {
                    result.addError(field, `${rules.label || field} 必须是以下值之一: ${rules.enum.join(', ')}`);
                }
            }

            // 自定义验证
            if (rules.validator && typeof rules.validator === 'function') {
                const customResult = rules.validator(value, data);
                if (customResult !== true) {
                    result.addError(field, customResult || `${rules.label || field} 验证失败`);
                }
            }
        }

        return result;
    }

    /**
     * 验证类型
     * @param {*} value - 值
     * @param {string} type - 期望类型
     * @returns {boolean} 是否匹配
     */
    static validateType(value, type) {
        switch (type) {
            case DataTypes.STRING:
                return typeof value === 'string';
            case DataTypes.NUMBER:
                return typeof value === 'number' && !isNaN(value);
            case DataTypes.BOOLEAN:
                return typeof value === 'boolean';
            case DataTypes.ARRAY:
                return Array.isArray(value);
            case DataTypes.OBJECT:
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case DataTypes.FUNCTION:
                return typeof value === 'function';
            default:
                return true;
        }
    }

    /**
     * 验证组件配置
     * @param {Object} config - 组件配置
     * @param {Object} configSchema - 配置 Schema
     * @returns {ValidationResult} 验证结果
     */
    static validateComponentConfig(config, configSchema) {
        const schema = {};

        // 将 configSchema 转换为验证规则
        for (const field of configSchema) {
            schema[field.key] = {
                label: field.label,
                required: field.required || false,
                type: this.mapFieldTypeToDataType(field.type),
                min: field.min,
                max: field.max,
                pattern: field.pattern,
                enum: field.options?.map((opt) => opt.value),
                validator: field.validator
            };
        }

        return this.validate(config, schema);
    }

    /**
     * 映射字段类型到数据类型
     * @param {string} fieldType - 字段类型
     * @returns {string} 数据类型
     */
    static mapFieldTypeToDataType(fieldType) {
        const typeMap = {
            text: DataTypes.STRING,
            number: DataTypes.NUMBER,
            boolean: DataTypes.BOOLEAN,
            select: DataTypes.STRING,
            color: DataTypes.STRING,
            vector3: DataTypes.ARRAY
        };
        return typeMap[fieldType] || null;
    }

    /**
     * 验证 URL
     * @param {string} url - URL 字符串
     * @returns {boolean} 是否有效
     */
    static isValidURL(url) {
        if (!url || typeof url !== 'string') return false;

        // 支持相对路径和绝对路径
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return true;
        }

        // 验证绝对 URL
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 验证颜色值
     * @param {string} color - 颜色值
     * @returns {boolean} 是否有效
     */
    static isValidColor(color) {
        if (!color || typeof color !== 'string') return false;

        // 支持 hex、rgb、rgba、颜色名称
        const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
        const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;

        return hexPattern.test(color) || rgbPattern.test(color) || rgbaPattern.test(color);
    }

    /**
     * 验证 Vector3
     * @param {Array} vector - 向量数组
     * @returns {boolean} 是否有效
     */
    static isValidVector3(vector) {
        return (
            Array.isArray(vector) &&
            vector.length === 3 &&
            vector.every((v) => typeof v === 'number' && !isNaN(v))
        );
    }
}

/**
 * 快捷验证方法
 */
export const validate = (data, schema) => Validator.validate(data, schema);
export const validateComponentConfig = (config, configSchema) =>
    Validator.validateComponentConfig(config, configSchema);
export const isValidURL = (url) => Validator.isValidURL(url);
export const isValidColor = (color) => Validator.isValidColor(color);
export const isValidVector3 = (vector) => Validator.isValidVector3(vector);

