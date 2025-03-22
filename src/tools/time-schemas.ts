import { z } from "zod";

// Time tool schemas
export const GetCurrentTimeSchema = z.object({
  timezone: z.string().describe("IANA timezone name (e.g., 'America/New_York', 'Europe/London')"),
});

export const ConvertTimeSchema = z.object({
  source_timezone: z.string().describe("Source IANA timezone name (e.g., 'America/New_York')"),
  time: z.string().describe("Time to convert in 24-hour format (HH:MM)"),
  target_timezone: z.string().describe("Target IANA timezone name (e.g., 'Asia/Tokyo')"),
});
