import { z } from "zod";
export declare const SearchRepositoriesSchema: z.ZodObject<{
    query: z.ZodString;
    page: z.ZodOptional<z.ZodNumber>;
    perPage: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    page?: number | undefined;
    perPage?: number | undefined;
}, {
    query: string;
    page?: number | undefined;
    perPage?: number | undefined;
}>;
export declare const GetFileContentsSchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    path: z.ZodString;
    branch: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    owner: string;
    repo: string;
    branch?: string | undefined;
}, {
    path: string;
    owner: string;
    repo: string;
    branch?: string | undefined;
}>;
export declare const CreateIssueSchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    owner: string;
    repo: string;
    title: string;
    body: string;
    labels?: string[] | undefined;
    assignees?: string[] | undefined;
}, {
    owner: string;
    repo: string;
    title: string;
    body: string;
    labels?: string[] | undefined;
    assignees?: string[] | undefined;
}>;
export declare const GetIssueSchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    issue_number: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    owner: string;
    repo: string;
    issue_number: number;
}, {
    owner: string;
    repo: string;
    issue_number: number;
}>;
