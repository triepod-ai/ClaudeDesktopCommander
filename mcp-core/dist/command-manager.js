import fs from 'fs/promises';
import { CONFIG_FILE } from './config.js';
class CommandManager {
    constructor() {
        this.blockedCommands = new Set();
    }
    async loadBlockedCommands() {
        try {
            const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
            const config = JSON.parse(configData);
            this.blockedCommands = new Set(config.blockedCommands);
        }
        catch (error) {
            this.blockedCommands = new Set();
        }
    }
    async saveBlockedCommands() {
        try {
            const config = {
                blockedCommands: Array.from(this.blockedCommands)
            };
            await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
        }
        catch (error) {
            // Handle error if needed
        }
    }
    validateCommand(command) {
        const baseCommand = command.split(' ')[0].toLowerCase().trim();
        return !this.blockedCommands.has(baseCommand);
    }
    async blockCommand(command) {
        command = command.toLowerCase().trim();
        if (this.blockedCommands.has(command)) {
            return false;
        }
        this.blockedCommands.add(command);
        await this.saveBlockedCommands();
        return true;
    }
    async unblockCommand(command) {
        command = command.toLowerCase().trim();
        if (!this.blockedCommands.has(command)) {
            return false;
        }
        this.blockedCommands.delete(command);
        await this.saveBlockedCommands();
        return true;
    }
    listBlockedCommands() {
        return Array.from(this.blockedCommands).sort();
    }
}
export const commandManager = new CommandManager();
