interface SearchReplace {
    search: string;
    replace: string;
}
export declare function performSearchReplace(filePath: string, block: SearchReplace): Promise<void>;
export declare function parseEditBlock(blockContent: string): Promise<{
    filePath: string;
    searchReplace: SearchReplace;
}>;
export {};
