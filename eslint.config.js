import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    prettier,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly'
            }
        },
        rules: {
            // 代码风格
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'never'],
            
            // 最佳实践
            'no-console': 'warn',
            'no-debugger': 'warn',
            'no-unused-vars': ['warn', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            
            // ES6
            'prefer-const': 'error',
            'prefer-arrow-callback': 'warn',
            'arrow-spacing': 'error',
            'no-var': 'error',
            
            // 其他
            'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
            'eol-last': ['error', 'always']
        }
    },
    {
        files: ['packages/**/*.js'],
        ignores: ['**/node_modules/**', '**/dist/**']
    }
];
