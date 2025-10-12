#!/usr/bin/env node

/**
 * 发布脚本
 * 
 * 用于发布新版本
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(chalk.blue('📦 准备发布新版本...\n'));

rl.question('确认要发布新版本吗？(yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        try {
            console.log(chalk.blue('\n1️⃣ 运行测试...'));
            execSync('pnpm test', { stdio: 'inherit' });

            console.log(chalk.blue('\n2️⃣ 构建所有包...'));
            execSync('pnpm build', { stdio: 'inherit' });

            console.log(chalk.blue('\n3️⃣ 使用 Lerna 发布...'));
            execSync('lerna publish', { stdio: 'inherit' });

            console.log(chalk.green('\n✅ 发布成功！'));
        } catch (error) {
            console.error(chalk.red('\n❌ 发布失败：'), error.message);
            process.exit(1);
        }
    } else {
        console.log(chalk.yellow('\n❌ 取消发布'));
    }

    rl.close();
});

