import { spawn } from 'child_process';
import { DEFAULT_COMMAND_TIMEOUT } from './config.js';
import { logError, logInfo, logDebug } from './logger.js';
export class TerminalManager {
    constructor() {
        this.sessions = new Map();
        this.completedSessions = new Map();
    }
    async executeCommand(command, timeoutMs = DEFAULT_COMMAND_TIMEOUT) {
        logInfo(`Executing command: ${command}`, { timeout: timeoutMs });
        const process = spawn(command, [], { shell: true });
        let output = '';
        // Ensure process.pid is defined before proceeding
        if (!process.pid) {
            logError('Failed to get process ID for command', undefined, { command });
            throw new Error('Failed to get process ID');
        }
        const session = {
            pid: process.pid,
            process,
            lastOutput: '',
            isBlocked: false,
            startTime: new Date()
        };
        this.sessions.set(process.pid, session);
        logDebug(`Process started with PID ${process.pid}`);
        return new Promise((resolve) => {
            process.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                session.lastOutput += text;
            });
            process.stderr.on('data', (data) => {
                const text = data.toString();
                output += text;
                session.lastOutput += text;
            });
            setTimeout(() => {
                session.isBlocked = true;
                logDebug(`Command execution timeout reached for PID ${process.pid}`, {
                    pid: process.pid,
                    command,
                    timeout: timeoutMs
                });
                resolve({
                    pid: process.pid,
                    output,
                    isBlocked: true
                });
            }, timeoutMs);
            process.on('exit', (code) => {
                if (process.pid) {
                    logDebug(`Process ${process.pid} exited with code ${code}`, { command });
                    // Store completed session before removing active session
                    this.completedSessions.set(process.pid, {
                        pid: process.pid,
                        output: output + session.lastOutput, // Combine all output
                        exitCode: code,
                        startTime: session.startTime,
                        endTime: new Date()
                    });
                    // Keep only last 100 completed sessions
                    if (this.completedSessions.size > 100) {
                        const oldestKey = Array.from(this.completedSessions.keys())[0];
                        this.completedSessions.delete(oldestKey);
                    }
                    this.sessions.delete(process.pid);
                }
                resolve({
                    pid: process.pid,
                    output,
                    isBlocked: false
                });
            });
        });
    }
    getNewOutput(pid) {
        // First check active sessions
        const session = this.sessions.get(pid);
        if (session) {
            const output = session.lastOutput;
            session.lastOutput = '';
            return output;
        }
        // Then check completed sessions
        const completedSession = this.completedSessions.get(pid);
        if (completedSession) {
            // Format completion message with exit code and runtime
            const runtime = (completedSession.endTime.getTime() - completedSession.startTime.getTime()) / 1000;
            return `Process completed with exit code ${completedSession.exitCode}\nRuntime: ${runtime}s\nFinal output:\n${completedSession.output}`;
        }
        logDebug(`No output found for PID ${pid}`);
        return null;
    }
    forceTerminate(pid) {
        const session = this.sessions.get(pid);
        if (!session) {
            logInfo(`Terminate requested for nonexistent process: ${pid}`);
            return false;
        }
        try {
            logInfo(`Terminating process ${pid} with SIGINT`);
            session.process.kill('SIGINT');
            setTimeout(() => {
                if (this.sessions.has(pid)) {
                    logInfo(`Process ${pid} still running after SIGINT, sending SIGKILL`);
                    session.process.kill('SIGKILL');
                }
            }, 1000);
            return true;
        }
        catch (error) {
            logError(`Failed to terminate process ${pid}`, error instanceof Error ? error : new Error(String(error)));
            return false;
        }
    }
    listActiveSessions() {
        const now = new Date();
        const sessions = Array.from(this.sessions.values()).map(session => ({
            pid: session.pid,
            isBlocked: session.isBlocked,
            runtime: now.getTime() - session.startTime.getTime()
        }));
        logDebug(`Listed ${sessions.length} active sessions`);
        return sessions;
    }
    listCompletedSessions() {
        const sessions = Array.from(this.completedSessions.values());
        logDebug(`Listed ${sessions.length} completed sessions`);
        return sessions;
    }
}
export const terminalManager = new TerminalManager();
