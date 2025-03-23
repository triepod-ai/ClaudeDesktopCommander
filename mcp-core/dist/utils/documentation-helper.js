// src/utils/documentation-helper.ts
import { documentationMetadata, toolDocumentationMap } from './documentation-metadata.js';
/**
 * Find documentation files for a specific tool
 * @param toolName Name of the tool to find documentation for
 * @returns Array of file paths where documentation for this tool can be found
 */
export function findDocumentationForTool(toolName) {
    return toolDocumentationMap[toolName] || [];
}
/**
 * Get detailed information about a documentation file
 * @param path File path of the documentation
 * @returns Documentation details or undefined if not found
 */
export function getDocumentationDetails(path) {
    return documentationMetadata.find(doc => doc.path === path);
}
/**
 * List all available tools
 * @returns Array of tool names
 */
export function listAllTools() {
    return Object.keys(toolDocumentationMap);
}
/**
 * Find all documentation related to multiple tools
 * @param toolNames Array of tool names to find documentation for
 * @returns Map of tool names to documentation paths
 */
export function findDocumentationForTools(toolNames) {
    const result = {};
    toolNames.forEach(toolName => {
        result[toolName] = findDocumentationForTool(toolName);
    });
    return result;
}
/**
 * Find tools that share documentation with the specified tool
 * @param toolName Name of the tool to find related tools for
 * @returns Array of tool names that share documentation with the specified tool
 */
export function findRelatedTools(toolName) {
    const docs = findDocumentationForTool(toolName);
    if (!docs.length)
        return [];
    const relatedTools = new Set();
    Object.entries(toolDocumentationMap).forEach(([otherTool, otherDocs]) => {
        if (otherTool !== toolName && otherDocs.some(doc => docs.includes(doc))) {
            relatedTools.add(otherTool);
        }
    });
    return Array.from(relatedTools);
}
/**
 * Get documentation files that cover a specific set of tools
 * @param toolNames Array of tool names to find common documentation for
 * @returns Array of documentation paths that cover all the specified tools
 */
export function findCommonDocumentation(toolNames) {
    if (!toolNames.length)
        return [];
    // Get documentation for the first tool
    let commonDocs = new Set(findDocumentationForTool(toolNames[0]));
    // Intersect with documentation for each other tool
    for (let i = 1; i < toolNames.length; i++) {
        const toolDocs = new Set(findDocumentationForTool(toolNames[i]));
        commonDocs = new Set(Array.from(commonDocs).filter(doc => toolDocs.has(doc)));
    }
    return Array.from(commonDocs);
}
