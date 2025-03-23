export interface ToolDocumentation {
    name: string;
    path: string;
    description: string;
    toolCoverage: string[];
    lastUpdated: Date;
}
export declare const documentationMetadata: ToolDocumentation[];
export declare const toolDocumentationMap: Record<string, string[]>;
