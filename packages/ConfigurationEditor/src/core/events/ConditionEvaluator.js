/**
 * ConditionEvaluator.js - 条件判断器
 * 
 * @description 解析和评估条件表达式
 * @features
 * - 条件表达式解析
 * - 逻辑运算（AND、OR、NOT）
 * - 比较运算（>、<、>=、<=、==、!=）
 * - 算术运算（+、-、*、/、%）
 * - 字符串操作（包含、匹配、正则表达式）
 * - 数据路径访问（如 data.user.name）
 * 
 * @author W3D Team
 * @date 2025-10-30
 */

import { ConditionOperator } from './EventTypes.js';

/**
 * 条件评估器
 */
export class ConditionEvaluator {
  constructor() {
    this.context = {};
  }
  
  /**
   * 设置上下文数据
   */
  setContext(context) {
    this.context = context || {};
  }
  
  /**
   * 评估条件表达式
   * @param {Object|String} condition - 条件对象或表达式字符串
   * @returns {Boolean} 评估结果
   */
  evaluate(condition) {
    if (!condition) {
      return true; // 无条件时默认为 true
    }
    
    // 如果是字符串，解析为条件对象
    if (typeof condition === 'string') {
      condition = this.parseExpression(condition);
    }
    
    // 如果是条件对象，评估条件
    if (typeof condition === 'object') {
      return this.evaluateCondition(condition);
    }
    
    return Boolean(condition);
  }
  
  /**
   * 评估条件对象
   */
  evaluateCondition(condition) {
    const { type, operator, left, right, conditions } = condition;
    
    // 逻辑运算
    if (type === 'logical') {
      return this.evaluateLogical(operator, conditions);
    }
    
    // 比较运算
    if (type === 'comparison') {
      const leftValue = this.getValue(left);
      const rightValue = this.getValue(right);
      return this.evaluateComparison(operator, leftValue, rightValue);
    }
    
    // 字符串运算
    if (type === 'string') {
      const leftValue = this.getValue(left);
      const rightValue = this.getValue(right);
      return this.evaluateString(operator, leftValue, rightValue);
    }
    
    // 存在性检查
    if (type === 'exists') {
      return this.getValue(left) !== undefined && this.getValue(left) !== null;
    }
    
    return false;
  }
  
  /**
   * 评估逻辑运算
   */
  evaluateLogical(operator, conditions) {
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return false;
    }
    
    switch (operator) {
      case ConditionOperator.AND:
        return conditions.every(cond => this.evaluateCondition(cond));
      
      case ConditionOperator.OR:
        return conditions.some(cond => this.evaluateCondition(cond));
      
      case ConditionOperator.NOT:
        return !this.evaluateCondition(conditions[0]);
      
      default:
        return false;
    }
  }
  
  /**
   * 评估比较运算
   */
  evaluateComparison(operator, left, right) {
    switch (operator) {
      case ConditionOperator.EQUAL:
        return left == right; // 使用 == 允许类型转换
      
      case ConditionOperator.NOT_EQUAL:
        return left != right;
      
      case ConditionOperator.GREATER_THAN:
        return left > right;
      
      case ConditionOperator.GREATER_EQUAL:
        return left >= right;
      
      case ConditionOperator.LESS_THAN:
        return left < right;
      
      case ConditionOperator.LESS_EQUAL:
        return left <= right;
      
      case ConditionOperator.IN:
        if (Array.isArray(right)) {
          return right.includes(left);
        }
        if (typeof right === 'string') {
          return right.includes(String(left));
        }
        return false;
      
      default:
        return false;
    }
  }
  
  /**
   * 评估字符串运算
   */
  evaluateString(operator, left, right) {
    const leftStr = String(left);
    const rightStr = String(right);
    
    switch (operator) {
      case ConditionOperator.CONTAINS:
        return leftStr.includes(rightStr);
      
      case ConditionOperator.STARTS_WITH:
        return leftStr.startsWith(rightStr);
      
      case ConditionOperator.ENDS_WITH:
        return leftStr.endsWith(rightStr);
      
      case ConditionOperator.MATCHES:
        try {
          const regex = new RegExp(rightStr);
          return regex.test(leftStr);
        } catch (error) {
          console.error('Invalid regex pattern:', rightStr, error);
          return false;
        }
      
      default:
        return false;
    }
  }
  
  /**
   * 获取值（支持数据路径访问）
   */
  getValue(value) {
    // 如果是字面量值
    if (typeof value !== 'string') {
      return value;
    }
    
    // 如果是字符串字面量（用引号包裹）
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // 如果是数字字面量
    if (!isNaN(value) && value.trim() !== '') {
      return Number(value);
    }
    
    // 如果是布尔字面量
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    
    // 否则作为数据路径访问
    return this.getValueByPath(value);
  }
  
  /**
   * 通过路径获取值（如 data.user.name）
   */
  getValueByPath(path) {
    if (!path) {
      return undefined;
    }
    
    const keys = path.split('.');
    let value = this.context;
    
    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[key];
    }
    
    return value;
  }
  
  /**
   * 解析表达式字符串为条件对象
   * 简单实现，支持基本的比较表达式
   */
  parseExpression(expression) {
    expression = expression.trim();
    
    // 检查逻辑运算符
    if (expression.includes('&&')) {
      const parts = expression.split('&&').map(p => p.trim());
      return {
        type: 'logical',
        operator: ConditionOperator.AND,
        conditions: parts.map(p => this.parseExpression(p))
      };
    }
    
    if (expression.includes('||')) {
      const parts = expression.split('||').map(p => p.trim());
      return {
        type: 'logical',
        operator: ConditionOperator.OR,
        conditions: parts.map(p => this.parseExpression(p))
      };
    }
    
    if (expression.startsWith('!')) {
      return {
        type: 'logical',
        operator: ConditionOperator.NOT,
        conditions: [this.parseExpression(expression.slice(1).trim())]
      };
    }
    
    // 检查比较运算符
    const comparisonOps = ['>=', '<=', '==', '!=', '>', '<'];
    for (const op of comparisonOps) {
      if (expression.includes(op)) {
        const [left, right] = expression.split(op).map(p => p.trim());
        return {
          type: 'comparison',
          operator: op,
          left,
          right
        };
      }
    }
    
    // 默认返回存在性检查
    return {
      type: 'exists',
      left: expression
    };
  }
  
  /**
   * 创建条件对象（辅助方法）
   */
  static createCondition(type, operator, ...args) {
    switch (type) {
      case 'logical':
        return {
          type: 'logical',
          operator,
          conditions: args[0] || []
        };
      
      case 'comparison':
        return {
          type: 'comparison',
          operator,
          left: args[0],
          right: args[1]
        };
      
      case 'string':
        return {
          type: 'string',
          operator,
          left: args[0],
          right: args[1]
        };
      
      case 'exists':
        return {
          type: 'exists',
          left: args[0]
        };
      
      default:
        return null;
    }
  }
}

export default ConditionEvaluator;

