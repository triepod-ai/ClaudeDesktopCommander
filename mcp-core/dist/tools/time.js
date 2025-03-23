import { logError, logInfo } from '../logger.js';
import { GetCurrentTimeSchema, ConvertTimeSchema } from './time-schemas.js';
// Time zone utilities
function getZoneInfo(timezoneName) {
    try {
        // Validate timezone by attempting to create a date with it
        const testDate = new Date().toLocaleString('en-US', { timeZone: timezoneName });
        return timezoneName;
    }
    catch (error) {
        throw new Error(`Invalid timezone: ${timezoneName}`);
    }
}
function getCurrentLocalTimezone() {
    // Extract timezone from system
    try {
        const timezoneOffset = -new Date().getTimezoneOffset();
        const hours = Math.floor(Math.abs(timezoneOffset) / 60);
        const minutes = Math.abs(timezoneOffset) % 60;
        const sign = timezoneOffset >= 0 ? '+' : '-';
        // This is a fallback that returns UTC offset instead of IANA name
        return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    catch (error) {
        logError('Error getting local timezone', error instanceof Error ? error : new Error(String(error)));
        return 'UTC';
    }
}
// Get current time in specified timezone
export async function getCurrentTime(args) {
    try {
        const parsed = GetCurrentTimeSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for get_current_time: ${JSON.stringify(parsed.error)}`);
        }
        const timezone = getZoneInfo(parsed.data.timezone);
        const now = new Date();
        // Format the current time in the specified timezone
        const formattedTime = now.toLocaleString('en-US', {
            timeZone: timezone,
            dateStyle: 'full',
            timeStyle: 'long'
        });
        // Determine if the timezone is currently observing DST
        const januaryDate = new Date(now.getFullYear(), 0, 1);
        const julyDate = new Date(now.getFullYear(), 6, 1);
        const januaryOffset = januaryDate.getTimezoneOffset();
        const julyOffset = julyDate.getTimezoneOffset();
        const isDst = januaryOffset !== julyOffset &&
            now.getTimezoneOffset() === Math.min(januaryOffset, julyOffset);
        const result = {
            timezone: timezone,
            datetime: formattedTime,
            is_dst: isDst,
            iso_time: now.toISOString()
        };
        logInfo(`Time retrieved for timezone: ${timezone}`);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError('Error in getCurrentTime', error instanceof Error ? error : new Error(errorMessage));
        throw error;
    }
}
// Convert time between timezones
export async function convertTime(args) {
    try {
        const parsed = ConvertTimeSchema.safeParse(args);
        if (!parsed.success) {
            throw new Error(`Invalid arguments for convert_time: ${JSON.stringify(parsed.error)}`);
        }
        const sourceTimezone = getZoneInfo(parsed.data.source_timezone);
        const targetTimezone = getZoneInfo(parsed.data.target_timezone);
        // Parse the time
        const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timeRegex.test(parsed.data.time)) {
            throw new Error('Invalid time format. Expected HH:MM [24-hour format]');
        }
        const [hours, minutes] = parsed.data.time.split(':').map(Number);
        // Create a date for today with the given time
        const now = new Date();
        const sourceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        // Get formatted times in both timezones
        const sourceFormatted = sourceDate.toLocaleString('en-US', {
            timeZone: sourceTimezone,
            dateStyle: 'full',
            timeStyle: 'long'
        });
        const targetFormatted = sourceDate.toLocaleString('en-US', {
            timeZone: targetTimezone,
            dateStyle: 'full',
            timeStyle: 'long'
        });
        // Calculate the offset between timezones
        const sourceOffsetMinutes = new Date().toLocaleString('en-US', { timeZone: sourceTimezone, timeZoneName: 'short' })
            .split(' ').pop()?.replace(/[^\d+-]/g, '') || '+0000';
        const targetOffsetMinutes = new Date().toLocaleString('en-US', { timeZone: targetTimezone, timeZoneName: 'short' })
            .split(' ').pop()?.replace(/[^\d+-]/g, '') || '+0000';
        // Calculate the time difference (this is simplified and may not handle all cases correctly)
        let hoursDifference = 0;
        try {
            const sourceOffset = parseInt(sourceOffsetMinutes.slice(0, 3)) * 60 + parseInt(sourceOffsetMinutes.slice(3));
            const targetOffset = parseInt(targetOffsetMinutes.slice(0, 3)) * 60 + parseInt(targetOffsetMinutes.slice(3));
            hoursDifference = (targetOffset - sourceOffset) / 60;
        }
        catch (error) {
            logError('Error calculating timezone difference', error instanceof Error ? error : new Error(String(error)));
            hoursDifference = 0;
        }
        const result = {
            source: {
                timezone: sourceTimezone,
                datetime: sourceFormatted
            },
            target: {
                timezone: targetTimezone,
                datetime: targetFormatted
            },
            time_difference: `${hoursDifference >= 0 ? '+' : ''}${hoursDifference.toFixed(1)}h`
        };
        logInfo(`Time converted from ${sourceTimezone} to ${targetTimezone}`);
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError('Error in convertTime', error instanceof Error ? error : new Error(errorMessage));
        throw error;
    }
}
