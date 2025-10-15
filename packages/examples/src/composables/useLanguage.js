import { useI18n } from 'vue-i18n';

/**
 * 语言管理 Composable
 * 提供语言切换和当前语言状态
 */
export function useLanguage() {
    const { t, locale } = useI18n();

    const languages = [
        { label: '中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' }
    ];

    const switchLanguage = (lang) => {
        locale.value = lang;
        localStorage.setItem('w3d-locale', lang);
    };

    return {
        t,
        locale,
        languages,
        switchLanguage
    };
}

