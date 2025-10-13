/**
 * Label3D 组件类型定义
 */

export interface LabelPosition {
    x: number;
    y: number;
    z: number;
}

export interface LabelConfig {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
    borderRadius?: number;
    backgroundImage?: string | null;
    billboard?: boolean;
    scale?: number;
    depthTest?: boolean;
    sizeAttenuation?: boolean;
}

export interface LabelData {
    id: string | number;
    label: string;
    position: LabelPosition;
    userData?: any;
    config?: LabelConfig;
}

export interface Label3DConfig {
    name?: string;
    labels?: LabelData[];
    globalConfig?: LabelConfig;
}

export class Label3D {
    constructor(scene: any, config?: Label3DConfig);
    
    createLabels(labels: LabelData[]): Promise<void>;
    createLabel(labelData: LabelData): Promise<void>;
    updateLabel(id: string | number, updates: Partial<LabelData>): Promise<void>;
    removeLabel(id: string | number): void;
    getLabel(id: string | number): LabelData | undefined;
    getAllLabels(): LabelData[];
    clearLabels(): void;
    showLabel(id: string | number): void;
    hideLabel(id: string | number): void;
    getInteractiveObjects(): any[];
}

