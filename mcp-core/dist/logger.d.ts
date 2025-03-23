/**
 * logger.ts
 * Central logging interface for the Claude Desktop Commander
 */
/**
 * Log an error message and optionally record stack trace
 * @param message Error message
 * @param error Optional error object for stack trace
 * @param metadata Additional contextual information
 */
export declare function logError(message: string, error?: Error, metadata?: Record<string, any>): void;
/**
 * Log a warning message
 * @param message Warning message
 * @param metadata Additional contextual information
 */
export declare function logWarning(message: string, metadata?: Record<string, any>): void;
/**
 * Log an info message
 * @param message Info message
 * @param metadata Additional contextual information
 */
export declare function logInfo(message: string, metadata?: Record<string, any>): void;
/**
 * Log a debug message
 * @param message Debug message
 * @param metadata Additional contextual information
 */
export declare function logDebug(message: string, metadata?: Record<string, any>): void;
/**
 * Log a tool request
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 */
export declare function logToolRequest(toolName: string, args: unknown): void;
/**
 * Log a tool response
 * @param toolName Name of the tool that was called
 * @param isError Whether the response is an error
 * @param content Response content (condensed for logging)
 */
export declare function logToolResponse(toolName: string, isError: boolean, content: string): void;
/**
 * Initialize the logging system
 */
export declare function initializeLogging(): void;
/**
 * Shutdown the logging system
 */
export declare function shutdownLogging(): Promise<void>;
export declare const logger: import("./utils/logging.js").Logger;
