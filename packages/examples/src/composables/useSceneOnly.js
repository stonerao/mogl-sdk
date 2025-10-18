/**
 * 检测 URL 参数中的 sceneOnly 标志
 * 用于判断是否只显示场景面板（隐藏代码面板和标题）
 */
export function useSceneOnly() {
    const urlParams = new URLSearchParams(window.location.search);
    const sceneOnly = urlParams.get('sceneOnly') === 'true';
    return sceneOnly;
}

