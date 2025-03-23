declare class CommandManager {
    private blockedCommands;
    loadBlockedCommands(): Promise<void>;
    saveBlockedCommands(): Promise<void>;
    validateCommand(command: string): boolean;
    blockCommand(command: string): Promise<boolean>;
    unblockCommand(command: string): Promise<boolean>;
    listBlockedCommands(): string[];
}
export declare const commandManager: CommandManager;
export {};
