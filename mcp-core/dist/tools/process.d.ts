export declare function listProcesses(): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
export declare function killProcess(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
