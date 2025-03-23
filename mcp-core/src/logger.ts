/**
 * logger.ts
 * Central logging interface for the Claude Desktop Commander
 */

import { logger as utilsLogger } from './utils/logging.js';
import { LOG_FILE, ERROR_LOG_FILE } from './config.js';

/**
 * Log an error message and optionally record stack trace
 * @param message Error message
 * @param error Optional error object for stack trace
 * @param metadata Additional contextual information
 */
export function logError(message: string, error?: Error, metadata: Record<string, any> = {}): void {
  const enhancedMetadata = { ...metadata };
  
  if (error) {
    enhancedMetadata.stack = error.stack;
    enhancedMetadata.name = error.name;
  }
  
  utilsLogger.error(message, {
    ...enhancedMetadata,
    source: 'desktop-commander'
  });
}

/**
 * Log a warning message
 * @param message Warning message
 * @param metadata Additional contextual information
 */
export function logWarning(message: string, metadata: Record<string, any> = {}): void {
  utilsLogger.warn(message, {
    ...metadata,
    source: 'desktop-commander'
  });
}

/**
 * Log an info message
 * @param message Info message
 * @param metadata Additional contextual information
 */
export function logInfo(message: string, metadata: Record<string, any> = {}): void {
  utilsLogger.info(message, {
    ...metadata,
    source: 'desktop-commander'
  });
}

/**
 * Log a debug message
 * @param message Debug message
 * @param metadata Additional contextual information
 */
export function logDebug(message: string, metadata: Record<string, any> = {}): void {
  utilsLogger.debug(message, {
    ...metadata,
    source: 'desktop-commander'
  });
}

/**
 * Log a tool request
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 */
export function logToolRequest(toolName: string, args: unknown): void {
  utilsLogger.info(`Tool request: ${toolName}`, {
    source: 'desktop-commander:tools',
    tool: toolName,
    args: JSON.stringify(args)
  });
}

/**
 * Log a tool response
 * @param toolName Name of the tool that was called
 * @param isError Whether the response is an error
 * @param content Response content (condensed for logging)
 */
export function logToolResponse(toolName: string, isError: boolean, content: string): void {
  if (isError) {
    utilsLogger.error(`Tool error: ${toolName}`, {
      source: 'desktop-commander:tools',
      tool: toolName,
      response: content.substring(0, 500) // Limit length for logging
    });
  } else {
    utilsLogger.debug(`Tool success: ${toolName}`, {
      source: 'desktop-commander:tools',
      tool: toolName,
      response: content.length > 100 ? `${content.substring(0, 100)}...` : content
    });
  }
}

/**
 * Initialize the logging system
 */
export function initializeLogging(): void {
  // Configure file paths and options if needed
  logInfo('Logging system initialized', {
    logFile: LOG_FILE,
    errorLogFile: ERROR_LOG_FILE
  });
}

/**
 * Shutdown the logging system
 */
export async function shutdownLogging(): Promise<void> {
  await utilsLogger.close();
}

// Export the underlying logger for advanced usage
export const logger = utilsLogger;
