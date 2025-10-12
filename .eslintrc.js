export default {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'prettier'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
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
};

