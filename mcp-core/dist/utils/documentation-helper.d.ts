import { ToolDocumentation } from './documentation-metadata.js';
/**
 * Find documentation files for a specific tool
 * @param toolName Name of the tool to find documentation for
 * @returns Array of file paths where documentation for this tool can be found
 */
export declare function findDocumentationForTool(toolName: string): string[];
/**
 * Get detailed information about a documentation file
 * @param path File path of the documentation
 * @returns Documentation details or undefined if not found
 */
export declare function getDocumentationDetails(path: string): ToolDocumentation | undefined;
/**
 * List all available tools
 * @returns Array of tool names
 */
export declare function listAllTools(): string[];
/**
 * Find all documentation related to multiple tools
 * @param toolNames Array of tool names to find documentation for
 * @returns Map of tool names to documentation paths
 */
export declare function findDocumentationForTools(toolNames: string[]): Record<string, string[]>;
/**
 * Find tools that share documentation with the specified tool
 * @param toolName Name of the tool to find related tools for
 * @returns Array of tool names that share documentation with the specified tool
 */
export declare function findRelatedTools(toolName: string): string[];
/**
 * Get documentation files that cover a specific set of tools
 * @param toolNames Array of tool names to find common documentation for
 * @returns Array of documentation paths that cover all the specified tools
 */
export declare function findCommonDocumentation(toolNames: string[]): string[];
