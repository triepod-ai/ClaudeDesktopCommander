export declare function executeCommand(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function readOutput(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function forceTerminate(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare function listSessions(): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
