/**
 * Handler for /analyze command
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Extract content from a target (file, directory, string)
 * @param {string} target - The target to extract content from
 * @returns {Promise<Object>} Extracted content and metadata
 */
async function extractContent(target) {
  // Check if target is a file path
  try {
    const stats = await fs.stat(target);
    
    if (stats.isFile()) {
      const content = await fs.readFile(target, 'utf8');
      const ext = path.extname(target).toLowerCase();
      
      return {
        type: 'file',
        path: target,
        filename: path.basename(target),
        extension: ext,
        content,
        size: stats.size
      };
    }
    
    if (stats.isDirectory()) {
      const files = await fs.readdir(target);
      const fileStats = await Promise.all(
        files.map(async file => {
          const filePath = path.join(target, file);
          const stats = await fs.stat(filePath);
          return {
            path: filePath,
            name: file,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            extension: path.extname(file).toLowerCase()
          };
        })
      );
      
      return {
        type: 'directory',
        path: target,
        files: fileStats,
        count: fileStats.length
      };
    }
  } catch (error) {
    // Not a file or directory, or can't access it
    console.warn(`Target "${target}" is not a valid file or directory:`, error);
  }
  
  // Treat as raw content
  return {
    type: 'content',
    content: target
  };
}

/**
 * Analyze code structure
 * @param {string} content - The code content to analyze
 * @param {string} ext - The file extension
 * @returns {Object} Analysis results
 */
function analyzeCodeStructure(content, ext) {
  const analysis = {
    lines: content.split('\n').length,
    functions: [],
    classes: [],
    imports: []
  };
  
  // This is a simplified implementation
  // In a real system, this would use language-specific parsers
  
  // Detect functions
  const functionMatches = content.match(/function\s+(\w+)\s*\(/g) || [];
  analysis.functions = functionMatches.map(match => {
    return match.replace(/function\s+/, '').replace(/\s*\($/, '');
  });
  
  // Detect classes
  const classMatches = content.match(/class\s+(\w+)/g) || [];
  analysis.classes = classMatches.map(match => {
    return match.replace(/class\s+/, '');
  });
  
  // Detect imports (for JavaScript/TypeScript)
  if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
    const importMatches = content.match(/import\s+.*\s+from\s+['"].*['"]/g) || [];
    analysis.imports = importMatches.map(match => match.trim());
  }
  
  return analysis;
}

/**
 * Analyze directory structure
 * @param {Object} directory - The directory information
 * @returns {Object} Analysis results
 */
function analyzeDirectoryStructure(directory) {
  const fileTypes = {};
  let totalSize = 0;
  
  // Count file types and calculate total size
  directory.files.forEach(file => {
    if (!file.isDirectory) {
      const ext = file.extension || 'unknown';
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      totalSize += file.size;
    }
  });
  
  return {
    path: directory.path,
    fileCount: directory.files.filter(f => !f.isDirectory).length,
    directoryCount: directory.files.filter(f => f.isDirectory).length,
    fileTypes,
    totalSize,
    averageFileSize: totalSize / directory.files.filter(f => !f.isDirectory).length || 0
  };
}

/**
 * Perform analysis based on goal type
 * @param {Object} content - The extracted content
 * @param {string} goal - The analysis goal
 * @returns {Object} Analysis results
 */
function performAnalysis(content, goal) {
  switch (goal.toLowerCase()) {
    case 'organize':
      if (content.type === 'directory') {
        return {
          type: 'organization',
          structure: analyzeDirectoryStructure(content),
          recommendations: generateOrganizationRecommendations(content)
        };
      } else {
        return {
          type: 'organization',
          error: 'Organization analysis requires a directory target'
        };
      }
      
    case 'refactor':
      if (content.type === 'file') {
        const codeAnalysis = analyzeCodeStructure(content.content, content.extension);
        return {
          type: 'refactoring',
          structure: codeAnalysis,
          recommendations: generateRefactoringRecommendations(content, codeAnalysis)
        };
      } else {
        return {
          type: 'refactoring',
          error: 'Refactoring analysis requires a file target'
        };
      }
      
    case 'document':
      if (content.type === 'file') {
        const codeAnalysis = analyzeCodeStructure(content.content, content.extension);
        return {
          type: 'documentation',
          structure: codeAnalysis,
          recommendations: generateDocumentationRecommendations(content, codeAnalysis)
        };
      } else if (content.type === 'directory') {
        return {
          type: 'documentation',
          structure: analyzeDirectoryStructure(content),
          recommendations: generateProjectDocumentationRecommendations(content)
        };
      } else {
        return {
          type: 'documentation',
          error: 'Documentation analysis requires a file or directory target'
        };
      }
      
    default:
      return {
        type: 'generic',
        summary: generateGenericAnalysis(content)
      };
  }
}

/**
 * Generate organization recommendations for a directory
 * @param {Object} directory - The directory information
 * @returns {Array} Recommendations
 */
function generateOrganizationRecommendations(directory) {
  const recommendations = [];
  
  // Check for too many files in a single directory
  if (directory.files.length > 20) {
    recommendations.push({
      type: 'structure',
      message: 'Consider grouping files into subdirectories to improve organization',
      priority: 'high'
    });
  }
  
  // Check for mixed file types
  const fileTypes = Object.keys(directory.files.reduce((types, file) => {
    if (!file.isDirectory) {
      const ext = file.extension || 'unknown';
      types[ext] = true;
    }
    return types;
  }, {}));
  
  if (fileTypes.length > 5) {
    recommendations.push({
      type: 'consistency',
      message: 'Directory contains many different file types. Consider separating by purpose or type.',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

/**
 * Generate refactoring recommendations for a file
 * @param {Object} file - The file information
 * @param {Object} analysis - The code analysis
 * @returns {Array} Recommendations
 */
function generateRefactoringRecommendations(file, analysis) {
  const recommendations = [];
  
  // Check for large file
  if (analysis.lines > 300) {
    recommendations.push({
      type: 'size',
      message: 'File is quite large. Consider breaking it into smaller modules.',
      priority: 'high'
    });
  }
  
  // Check for large functions (this is a very simple heuristic)
  // In a real system, this would involve actual code parsing
  const bigFunctions = analysis.functions.filter(fn => {
    const fnPattern = new RegExp(`function\\s+${fn}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?}`);
    const match = file.content.match(fnPattern);
    if (match) {
      return match[0].split('\n').length > 50;
    }
    return false;
  });
  
  if (bigFunctions.length > 0) {
    recommendations.push({
      type: 'complexity',
      message: `${bigFunctions.length} functions are quite large. Consider breaking them into smaller functions.`,
      functions: bigFunctions,
      priority: 'medium'
    });
  }
  
  return recommendations;
}

/**
 * Generate documentation recommendations for a file
 * @param {Object} file - The file information
 * @param {Object} analysis - The code analysis
 * @returns {Array} Recommendations
 */
function generateDocumentationRecommendations(file, analysis) {
  const recommendations = [];
  
  // Check for missing file header comment
  if (!file.content.startsWith('/**') && !file.content.startsWith('/*')) {
    recommendations.push({
      type: 'header',
      message: 'File lacks a header comment describing its purpose',
      priority: 'medium'
    });
  }
  
  // Check for functions without JSDoc comments
  // This is a simplified check
  const undocumentedFunctions = analysis.functions.filter(fn => {
    const fnIndex = file.content.indexOf(`function ${fn}`);
    if (fnIndex > 0) {
      const preceding = file.content.substring(fnIndex - 200, fnIndex);
      return !preceding.includes('/**');
    }
    return true;
  });
  
  if (undocumentedFunctions.length > 0) {
    recommendations.push({
      type: 'functions',
      message: `${undocumentedFunctions.length} functions lack JSDoc documentation`,
      functions: undocumentedFunctions,
      priority: 'high'
    });
  }
  
  return recommendations;
}

/**
 * Generate documentation recommendations for a project
 * @param {Object} directory - The directory information
 * @returns {Array} Recommendations
 */
function generateProjectDocumentationRecommendations(directory) {
  const recommendations = [];
  
  // Check for README file
  const hasReadme = directory.files.some(file => 
    file.name.toLowerCase() === 'readme.md' || file.name.toLowerCase() === 'readme'
  );
  
  if (!hasReadme) {
    recommendations.push({
      type: 'readme',
      message: 'Project lacks a README file',
      priority: 'high'
    });
  }
  
  // Check for LICENSE file
  const hasLicense = directory.files.some(file => 
    file.name.toLowerCase() === 'license' || file.name.toLowerCase() === 'license.md'
  );
  
  if (!hasLicense) {
    recommendations.push({
      type: 'license',
      message: 'Project lacks a LICENSE file',
      priority: 'medium'
    });
  }
  
  // Check for documentation directory
  const hasDocsDir = directory.files.some(file => 
    file.isDirectory && (file.name.toLowerCase() === 'docs' || file.name.toLowerCase() === 'documentation')
  );
  
  if (!hasDocsDir) {
    recommendations.push({
      type: 'docs',
      message: 'Project lacks a dedicated documentation directory',
      priority: 'low'
    });
  }
  
  return recommendations;
}

/**
 * Generate a generic analysis for any content
 * @param {Object} content - The content to analyze
 * @returns {Object} Analysis summary
 */
function generateGenericAnalysis(content) {
  if (content.type === 'file') {
    const ext = content.extension;
    let contentType = 'unknown';
    
    // Identify content type based on extension
    if (['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.java', '.c', '.cpp', '.cs'].includes(ext)) {
      contentType = 'code';
    } else if (['.md', '.txt', '.pdf', '.doc', '.docx'].includes(ext)) {
      contentType = 'document';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) {
      contentType = 'image';
    } else if (['.html', '.css'].includes(ext)) {
      contentType = 'web';
    } else if (['.json', '.xml', '.yaml', '.yml'].includes(ext)) {
      contentType = 'data';
    }
    
    return {
      type: contentType,
      path: content.path,
      size: content.size,
      lines: content.content.split('\n').length
    };
  } else if (content.type === 'directory') {
    return {
      path: content.path,
      fileCount: content.files.filter(f => !f.isDirectory).length,
      directoryCount: content.files.filter(f => f.isDirectory).length
    };
  } else {
    return {
      type: 'text',
      length: content.content.length,
      words: content.content.split(/\s+/).length
    };
  }
}

/**
 * Handle the /analyze command
 * @param {Object} command - The parsed command object
 * @returns {Promise<Object>} Result of the operation
 */
async function handleAnalyze(command) {
  const { target, goal } = command;
  
  try {
    // Extract content from target
    const content = await extractContent(target);
    
    // Perform analysis based on goal
    const analysis = performAnalysis(content, goal);
    
    return {
      success: true,
      target,
      goal,
      analysis
    };
  } catch (error) {
    console.error('Error analyzing target:', error);
    return {
      success: false,
      error: `Error analyzing target: ${error.message}`
    };
  }
}

module.exports = handleAnalyze;
