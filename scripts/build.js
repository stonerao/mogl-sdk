#!/usr/bin/env node

/**
 * 构建脚本
 * 
 * 用于构建所有包
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🔨 开始构建所有包...\n'));

try {
    // 使用 Lerna 构建所有包
    execSync('lerna run build --stream', {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    console.log(chalk.green('\n✅ 构建完成！'));
} catch (error) {
    console.error(chalk.red('\n❌ 构建失败：'), error.message);
    process.exit(1);
}

