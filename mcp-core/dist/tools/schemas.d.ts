import { z } from "zod";
export declare const ExecuteCommandArgsSchema: z.ZodObject<{
    command: z.ZodString;
    timeout_ms: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    command: string;
    timeout_ms?: number | undefined;
}, {
    command: string;
    timeout_ms?: number | undefined;
}>;
export declare const ReadOutputArgsSchema: z.ZodObject<{
    pid: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    pid: number;
}, {
    pid: number;
}>;
export declare const ForceTerminateArgsSchema: z.ZodObject<{
    pid: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    pid: number;
}, {
    pid: number;
}>;
export declare const ListSessionsArgsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const KillProcessArgsSchema: z.ZodObject<{
    pid: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    pid: number;
}, {
    pid: number;
}>;
export declare const BlockCommandArgsSchema: z.ZodObject<{
    command: z.ZodString;
}, "strip", z.ZodTypeAny, {
    command: string;
}, {
    command: string;
}>;
export declare const UnblockCommandArgsSchema: z.ZodObject<{
    command: z.ZodString;
}, "strip", z.ZodTypeAny, {
    command: string;
}, {
    command: string;
}>;
export declare const ReadFileArgsSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const ReadMultipleFilesArgsSchema: z.ZodObject<{
    paths: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    paths: string[];
}, {
    paths: string[];
}>;
export declare const WriteFileArgsSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    content: string;
}, {
    path: string;
    content: string;
}>;
export declare const CreateDirectoryArgsSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const ListDirectoryArgsSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const MoveFileArgsSchema: z.ZodObject<{
    source: z.ZodString;
    destination: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    destination: string;
}, {
    source: string;
    destination: string;
}>;
export declare const SearchFilesArgsSchema: z.ZodObject<{
    path: z.ZodString;
    pattern: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    pattern: string;
}, {
    path: string;
    pattern: string;
}>;
export declare const GetFileInfoArgsSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const EditBlockArgsSchema: z.ZodObject<{
    blockContent: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blockContent: string;
}, {
    blockContent: string;
}>;
