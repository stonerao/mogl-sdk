#!/usr/bin/env node

/**
 * 开发脚本
 * 
 * 启动开发服务器
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🚀 启动开发服务器...\n'));

try {
    // 启动 showcase 示例
    execSync('pnpm --filter showcase dev', {
        stdio: 'inherit',
        cwd: process.cwd()
    });
} catch (error) {
    console.error(chalk.red('\n❌ 启动失败：'), error.message);
    process.exit(1);
}

