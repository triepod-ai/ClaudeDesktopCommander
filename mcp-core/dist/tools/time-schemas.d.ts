import { z } from "zod";
export declare const GetCurrentTimeSchema: z.ZodObject<{
    timezone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timezone: string;
}, {
    timezone: string;
}>;
export declare const ConvertTimeSchema: z.ZodObject<{
    source_timezone: z.ZodString;
    time: z.ZodString;
    target_timezone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source_timezone: string;
    time: string;
    target_timezone: string;
}, {
    source_timezone: string;
    time: string;
    target_timezone: string;
}>;
