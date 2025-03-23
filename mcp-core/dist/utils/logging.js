/**
 * logging.ts
 * A comprehensive logging system with configurable outputs and database storage
 */
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { EventEmitter } from 'events';
import { CONFIG_FILE } from '../config.js';
// Default logging configuration
const DEFAULT_CONFIG = {
    level: 'info',
    format: 'simple',
    file: {
        enabled: true,
        defaultPath: './logs',
        clientPath: './logs/client',
        maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5
    },
    database: {
        enabled: false,
        sqlite: {
            path: './logs/log.db',
            batchSize: 100,
            flushInterval: 5000 // 5 seconds
        }
    },
    buffer: {
        enabled: true,
        maxSize: 1000,
        maxAge: 10000 // 10 seconds
    },
    fallback: {
        maxRetries: 5,
        retryInterval: 10000 // 10 seconds
    }
};
// Load configuration or use defaults
let config;
try {
    const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const fullConfig = JSON.parse(configData);
    config = fullConfig.logging || DEFAULT_CONFIG;
}
catch (error) {
    config = DEFAULT_CONFIG;
    console.warn('Could not load logging configuration, using defaults');
}
/**
 * Parse command line arguments to check for client flag
 * @returns Parsed command line arguments
 */
function parseArgs() {
    const args = {};
    process.argv.forEach((arg, index) => {
        if (arg === '-client') {
            args.client = true;
        }
        else if (arg.startsWith('--')) {
            // Handle named arguments (--name=value or --name value)
            const nameValue = arg.substring(2).split('=');
            if (nameValue.length === 2) {
                args[nameValue[0]] = nameValue[1];
            }
            else {
                const nextArg = process.argv[index + 1];
                if (nextArg && !nextArg.startsWith('-')) {
                    args[nameValue[0]] = nextArg;
                }
                else {
                    args[nameValue[0]] = true;
                }
            }
        }
    });
    return args;
}
/**
 * Represents a log entry
 */
class LogEntry {
    constructor(level, message, metadata = {}) {
        this.timestamp = new Date();
        this.level = level;
        this.message = message;
        this.metadata = metadata;
        this.source = metadata.source || 'app';
    }
    /**
     * Convert log entry to string format
     * @param format - Output format ('simple' or 'json')
     * @returns Formatted log entry
     */
    toString(format = 'simple') {
        if (format === 'json') {
            return JSON.stringify({
                timestamp: this.timestamp.toISOString(),
                level: this.level,
                message: this.message,
                source: this.source,
                ...this.metadata
            });
        }
        return `[${this.timestamp.toISOString()}] [${this.level.toUpperCase()}] [${this.source}] ${this.message}`;
    }
}
/**
 * Base transport class for log outputs
 */
class Transport extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.name = options.name || 'transport';
        this.level = options.level || config.level;
        this.format = options.format || config.format;
        this.enabled = options.enabled !== false;
        this.errorCount = 0;
    }
    /**
     * Check if the transport should log this level
     * @param level - Log level
     * @returns Whether to log this entry
     */
    shouldLog(level) {
        if (!this.enabled)
            return false;
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        return levels[level] <= levels[this.level];
    }
    /**
     * Log an entry
     * @param entry - The log entry
     * @returns Success status
     */
    async log(entry) {
        throw new Error('Method not implemented');
    }
    /**
     * Handle transport errors
     * @param error - The error that occurred
     */
    handleError(error) {
        this.errorCount++;
        this.emit('error', error, this);
        // Reset error count after some time to handle temporary issues
        setTimeout(() => {
            this.errorCount = Math.max(0, this.errorCount - 1);
        }, config.fallback.retryInterval);
    }
    /**
     * Close the transport
     */
    async close() {
        // Base implementation does nothing
    }
}
/**
 * File transport for logging to files
 */
class FileTransport extends Transport {
    constructor(options = {}) {
        super(options);
        this.bytesWritten = 0;
        this.maxSize = 5 * 1024 * 1024; // Default 5MB
        this.maxFiles = 5;
        this.name = options.name || 'file';
        // Determine log directory based on client flag
        const args = parseArgs();
        this.directory = args.client ?
            path.resolve(options.clientPath || config.file.clientPath) :
            path.resolve(options.path || config.file.defaultPath);
        // Ensure log directory exists
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }
        // Set log file path
        const filename = options.filename || `app-${this.name}.log`;
        this.filePath = path.join(this.directory, filename);
        // Create write stream
        this.stream = fs.createWriteStream(this.filePath, { flags: 'a' });
        this.stream.on('error', this.handleError.bind(this));
        // Set up file rotation
        this.setupRotation();
    }
    /**
     * Set up log file rotation
     */
    setupRotation() {
        this.bytesWritten = 0;
        this.maxSize = this.options.maxSize || config.file.maxSize;
        this.maxFiles = this.options.maxFiles || config.file.maxFiles;
    }
    /**
     * Rotate log file if it exceeds maximum size
     */
    async rotateFile() {
        if (this.bytesWritten < this.maxSize) {
            return;
        }
        // Close current stream
        this.stream.end();
        // Rotate existing log files
        for (let i = this.maxFiles - 1; i >= 0; i--) {
            const oldPath = i === 0 ? this.filePath : `${this.filePath}.${i}`;
            const newPath = `${this.filePath}.${i + 1}`;
            if (fs.existsSync(oldPath)) {
                if (i === this.maxFiles - 1) {
                    // Delete oldest log file
                    fs.unlinkSync(oldPath);
                }
                else {
                    // Rename log file
                    fs.renameSync(oldPath, newPath);
                }
            }
        }
        // Create new stream
        this.stream = fs.createWriteStream(this.filePath, { flags: 'a' });
        this.stream.on('error', this.handleError.bind(this));
        this.bytesWritten = 0;
    }
    /**
     * Log an entry to the file
     * @param entry - The log entry
     * @returns Success status
     */
    async log(entry) {
        if (!this.shouldLog(entry.level)) {
            return true;
        }
        try {
            // Format the log entry
            const logString = entry.toString(this.format) + '\n';
            // Write to the file
            this.stream.write(logString);
            // Update bytes written and check for rotation
            this.bytesWritten += Buffer.byteLength(logString);
            await this.rotateFile();
            return true;
        }
        catch (error) {
            this.handleError(error);
            return false;
        }
    }
    /**
     * Close the file transport
     */
    async close() {
        if (this.stream) {
            this.stream.end();
        }
    }
}
/**
 * SQLite transport for logging to database
 */
class SQLiteTransport extends Transport {
    constructor(options = {}) {
        super(options);
        this.name = options.name || 'sqlite';
        // SQLite configuration
        this.dbPath = options.path || config.database.sqlite.path;
        this.batchSize = options.batchSize || config.database.sqlite.batchSize;
        this.flushInterval = options.flushInterval || config.database.sqlite.flushInterval;
        // Initialize batch processing
        this.batch = [];
        this.connected = false;
        this.connecting = false;
        // Increase max listeners to avoid warnings during high-volume logging
        this.setMaxListeners(50);
        // Initialize database
        this.initDatabase();
        // Set up batch flushing interval
        this.flushTimer = setInterval(() => {
            this.flush().catch(this.handleError.bind(this));
        }, this.flushInterval);
    }
    /**
     * Initialize the SQLite database
     */
    async initDatabase() {
        try {
            // Ensure directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            this.connecting = true;
            // Open database connection
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });
            // Create logs table if it doesn't exist
            await this.db.exec(`
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          level TEXT NOT NULL,
          source TEXT NOT NULL,
          message TEXT NOT NULL,
          metadata TEXT
        )
      `);
            // Create index on timestamp and level for efficient querying
            await this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp_level
        ON logs (timestamp, level)
      `);
            // Prepare statements
            this.insertStmt = await this.db.prepare(`
        INSERT INTO logs (timestamp, level, source, message, metadata)
        VALUES (?, ?, ?, ?, ?)
      `);
            this.connected = true;
            this.connecting = false;
            this.emit('connected');
        }
        catch (error) {
            this.connecting = false;
            this.handleError(error);
        }
    }
    /**
     * Log an entry to the database
     * @param entry - The log entry
     * @returns Success status
     */
    async log(entry) {
        if (!this.shouldLog(entry.level)) {
            return true;
        }
        // Add to batch
        this.batch.push(entry);
        // Flush if batch is full
        if (this.batch.length >= this.batchSize) {
            return this.flush();
        }
        return true;
    }
    /**
     * Flush the current batch of log entries to the database
     * @returns Success status
     */
    async flush() {
        if (this.batch.length === 0) {
            return true;
        }
        // Wait for connection if connecting
        if (this.connecting) {
            return new Promise((resolve) => {
                this.once('connected', () => {
                    this.flush().then(resolve);
                });
            });
        }
        // Skip if not connected
        if (!this.connected) {
            return false;
        }
        const currentBatch = [...this.batch];
        this.batch = [];
        try {
            // Begin transaction
            await this.db.exec('BEGIN TRANSACTION');
            // Insert all entries
            for (const entry of currentBatch) {
                await this.insertStmt.run(entry.timestamp.toISOString(), entry.level, entry.source, entry.message, JSON.stringify(entry.metadata));
            }
            // Commit transaction
            await this.db.exec('COMMIT');
            return true;
        }
        catch (error) {
            // Rollback transaction
            try {
                await this.db.exec('ROLLBACK');
            }
            catch (rollbackError) {
                // Ignore rollback errors
            }
            // Put entries back in batch
            this.batch = [...currentBatch, ...this.batch];
            this.handleError(error);
            return false;
        }
    }
    /**
     * Close the database transport
     */
    async close() {
        clearInterval(this.flushTimer);
        try {
            await this.flush();
            if (this.db) {
                // Finalize prepared statements before closing
                if (this.insertStmt) {
                    await this.insertStmt.finalize();
                    this.insertStmt = null;
                }
                // Close the database
                await this.db.close();
            }
        }
        catch (error) {
            this.handleError(error);
        }
    }
}
/**
 * Memory buffer for high-performance logging
 */
class MemoryBuffer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.maxSize = options.maxSize || config.buffer.maxSize;
        this.maxAge = options.maxAge || config.buffer.maxAge;
        this.enabled = options.enabled !== false && config.buffer.enabled;
        this.entries = [];
        this.flushTimer = null;
        if (this.enabled) {
            this.flushTimer = setInterval(() => {
                this.flush();
            }, this.maxAge);
        }
    }
    /**
     * Add a log entry to the buffer
     * @param entry - The log entry
     */
    add(entry) {
        if (!this.enabled) {
            this.emit('entry', entry);
            return;
        }
        this.entries.push(entry);
        if (this.entries.length >= this.maxSize) {
            this.flush();
        }
    }
    /**
     * Flush all entries from the buffer
     */
    flush() {
        if (this.entries.length === 0) {
            return;
        }
        const entries = [...this.entries];
        this.entries = [];
        for (const entry of entries) {
            this.emit('entry', entry);
        }
    }
    /**
     * Close the memory buffer
     */
    close() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush();
    }
}
/**
 * Main Logger class
 */
class Logger extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.transports = [];
        this.buffer = new MemoryBuffer(options.buffer);
        // When a log entry is flushed from the buffer, send it to all transports
        this.buffer.on('entry', (entry) => {
            this.processEntry(entry);
        });
        // Initialize transports
        this.initTransports();
    }
    /**
     * Initialize logging transports
     */
    initTransports() {
        // Add file transport
        const fileTransport = new FileTransport({
            level: this.options.level || config.level,
            format: this.options.format || config.format
        });
        this.addTransport(fileTransport);
        // Add SQLite transport if enabled
        if (config.database.enabled) {
            const sqliteTransport = new SQLiteTransport({
                level: this.options.level || config.level,
                format: 'json' // Always use JSON for database logging
            });
            this.addTransport(sqliteTransport);
        }
        // Handle transport errors
        this.on('transport-error', this.handleTransportError.bind(this));
    }
    /**
     * Add a transport to the logger
     * @param transport - The transport to add
     */
    addTransport(transport) {
        this.transports.push(transport);
        transport.on('error', (error, transport) => {
            this.emit('transport-error', error, transport);
        });
    }
    /**
     * Handle transport errors and implement fallback
     * @param error - The error that occurred
     * @param transport - The transport that had an error
     */
    handleTransportError(error, transport) {
        console.error(`Error in transport ${transport.name}: ${error.message}`);
        // Check if transport should be disabled based on error count
        if (transport.errorCount >= config.fallback.maxRetries) {
            transport.enabled = false;
            console.error(`Disabled transport ${transport.name} due to repeated errors`);
            // Ensure at least one transport is enabled
            const enabledTransports = this.transports.filter(t => t.enabled);
            if (enabledTransports.length === 0) {
                // All transports failed, create emergency file transport
                const emergencyTransport = new FileTransport({
                    name: 'emergency',
                    path: './logs',
                    filename: 'emergency.log'
                });
                this.addTransport(emergencyTransport);
            }
            // Try to re-enable after some time
            setTimeout(() => {
                transport.enabled = true;
                transport.errorCount = 0;
                console.log(`Re-enabling transport ${transport.name}`);
            }, config.fallback.retryInterval * 10);
        }
    }
    /**
     * Process a log entry through all transports
     * @param entry - The log entry to process
     */
    async processEntry(entry) {
        const promises = this.transports
            .filter(transport => transport.shouldLog(entry.level))
            .map(transport => transport.log(entry).catch(error => {
            this.emit('transport-error', error, transport);
            return false;
        }));
        await Promise.all(promises);
    }
    /**
     * Log a message at a specific level
     * @param level - Log level
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    log(level, message, metadata = {}) {
        const entry = new LogEntry(level, message, metadata);
        this.buffer.add(entry);
    }
    /**
     * Log an error message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    error(message, metadata = {}) {
        this.log('error', message, metadata);
    }
    /**
     * Log a warning message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    warn(message, metadata = {}) {
        this.log('warn', message, metadata);
    }
    /**
     * Log an info message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }
    /**
     * Log a debug message
     * @param message - Log message
     * @param metadata - Additional metadata
     */
    debug(message, metadata = {}) {
        this.log('debug', message, metadata);
    }
    /**
     * Close the logger and all transports
     */
    async close() {
        this.buffer.close();
        for (const transport of this.transports) {
            await transport.close();
        }
    }
}
// Create and export a singleton logger instance
const logger = new Logger();
// Export the logger class and instance
export { Logger, logger, LogEntry, Transport, FileTransport, SQLiteTransport, parseArgs };
