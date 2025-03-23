/**
 * logging.ts
 * A comprehensive logging system with configurable outputs and database storage
 */
import fs from 'fs';
import { EventEmitter } from 'events';
/**
 * Parse command line arguments to check for client flag
 * @returns Parsed command line arguments
 */
declare function parseArgs(): Record<string, any>;
/**
 * Represents a log entry
 */
declare class LogEntry {
    timestamp: Date;
    level: string;
    message: string;
    metadata: Record<string, any>;
    source: string;
    constructor(level: string, message: string, metadata?: Record<string, any>);
    /**
     * Convert log entry to string format
     * @param format - Output format ('simple' or 'json')
     * @returns Formatted log entry
     */
    toString(format?: string): string;
}
/**
 * Base transport class for log outputs
 */
declare class Transport extends EventEmitter {
    options: Record<string, any>;
    name: string;
    level: string;
    format: string;
    enabled: boolean;
    errorCount: number;
    constructor(options?: Record<string, any>);
    /**
     * Check if the transport should log this level
     * @param level - Log level
     * @returns Whether to log this entry
     */
    shouldLog(level: string): boolean;
    /**
     * Log an entry
     * @param entry - The log entry
     * @returns Success status
     */
    log(entry: LogEntry): Promise<boolean>;
    /**
     * Handle transport errors
     * @param error - The error that occurred
     */
    handleError(error: Error): void;
    /**
     * Close the transport
     */
    close(): Promise<void>;
}
/**
 * File transport for logging to files
 */
declare class FileTransport extends Transport {
    directory: string;
    filePath: string;
    stream: fs.WriteStream;
    bytesWritten: number;
    maxSize: number;
    maxFiles: number;
    constructor(options?: Record<string, any>);
    /**
     * Set up log file rotation
     */
    setupRotation(): void;
    /**
     * Rotate log file if it exceeds maximum size
     */
    rotateFile(): Promise<void>;
    /**
     * Log an entry to the file
     * @param entry - The log entry
     * @returns Success status
     */
    log(entry: LogEntry): Promise<boolean>;
    /**
     * Close the file transport
     */
    close(): Promise<void>;
}
/**
 * SQLite transport for logging to database
 */
declare class SQLiteTransport extends Transport {
    dbPath: string;
    batchSize: number;
    flushInterval: number;
    batch: LogEntry[];
    connected: boolean;
    connecting: boolean;
    db: any;
    insertStmt: any;
    flushTimer: NodeJS.Timeout;
    constructor(options?: Record<string, any>);
    /**
     * Initialize the SQLite database
     */
    initDatabase(): Promise<void>;
    /**
     * Log an entry to the database
     * @param entry - The log entry
     * @returns Success status
     */
    log(entry: LogEntry): Promise<boolean>;
    /**
     * Flush the current batch of log entries to the database
     * @returns Success status
     */
    flush(): Promise<boolean>;
    /**
     * Close the database transport
     */
    close(): Promise<void>;
}
/**
 * Memory buffer for high-performance logging
 */
declare class MemoryBuffer extends EventEmitter {
    maxSize: number;
    maxAge: number;
    enabled: boolean;
    entries: LogEntry[];
    flushTimer: NodeJS.Timeout | null;
    constructor(options?: Record<string, any>);
    /**
     * Add a log entry to the buffer
     * @param entry - The log entry
     */
    add(entry: LogEntry): void;
    /**
     * Flush all entries from the buffer
     */
    flush(): void;
    /**
     * Close the memory buffer
     */
    close(): void;
}
/**
 * Main Logger class
 */
declare class Logger extends EventEmitter {
    options: Record<string, any>;
    transports: Transport[];
    buffer: MemoryBuffer;
    constructor(options?: Record<string, any>);
    /**
     * Initialize logging transports
     */
    initTransports(): void;
    /**
     * Add a transport to the logger
     * @param transport - The transport to add
     */
    addTransport(transport: Transport): void;
    /**
     * Handle transport errors and implement fallback
     * @param error - The error that occurred
     * @param transport - The transport that had an error
     */
    handleTransportError(error: Error, transport: Transport): void;
    /**
     * Process a log entry through all transports
     * @param entry - The log entry to process
     */
    processEntry(entry: LogEntry): Promise<void>;
    /**
     * Log a message at a specific level
     * @param level - Log level
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    log(level: string, message: string, metadata?: Record<string, any>): void;
    /**
     * Log an error message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    error(message: string, metadata?: Record<string, any>): void;
    /**
     * Log a warning message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    warn(message: string, metadata?: Record<string, any>): void;
    /**
     * Log an info message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    info(message: string, metadata?: Record<string, any>): void;
    /**
     * Log a debug message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    debug(message: string, metadata?: Record<string, any>): void;
    /**
     * Close the logger and all transports
     */
    close(): Promise<void>;
}
declare const logger: Logger;
export { Logger, logger, LogEntry, Transport, FileTransport, SQLiteTransport, parseArgs };
