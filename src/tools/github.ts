import { logError, logInfo } from '../logger.js';
import { 
  SearchRepositoriesSchema,
  GetFileContentsSchema,
  CreateIssueSchema,
  GetIssueSchema
} from './github-schemas.js';

// GitHub API URL
const GITHUB_API_URL = 'https://api.github.com';

// Helper function to get GitHub authentication token from environment
function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not found. Set GITHUB_TOKEN environment variable.');
  }
  return token;
}

// Helper function for making authenticated GitHub API requests
async function githubFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getGitHubToken();
  
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_URL}${endpoint}`;
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      const statusCode = response.status;
      const errorMessage = errorData.message || `GitHub API returned status ${statusCode}`;
      
      // Handle different error types
      if (statusCode === 401) {
        throw new Error(`Authentication Failed: ${errorMessage}`);
      } else if (statusCode === 403) {
        if (response.headers.get('X-RateLimit-Remaining') === '0') {
          const resetTime = new Date(
            parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000
          );
          throw new Error(`Rate Limit Exceeded: ${errorMessage}. Resets at ${resetTime.toISOString()}`);
        }
        throw new Error(`Permission Denied: ${errorMessage}`);
      } else if (statusCode === 404) {
        throw new Error(`Not Found: ${errorMessage}`);
      } else if (statusCode === 409) {
        throw new Error(`Conflict: ${errorMessage}`);
      } else if (statusCode === 422) {
        throw new Error(`Validation Error: ${errorMessage}. Details: ${JSON.stringify(errorData.errors || {})}`);
      } else {
        throw new Error(`GitHub API Error: ${errorMessage}`);
      }
    }
    
    // Return JSON response or empty object if no content
    if (response.status === 204) {
      return {};
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Only re-throw if this is already a formatted error
      if (error.message.startsWith('Authentication Failed') ||
          error.message.startsWith('Permission Denied') ||
          error.message.startsWith('Not Found') ||
          error.message.startsWith('Conflict') ||
          error.message.startsWith('Validation Error') ||
          error.message.startsWith('Rate Limit Exceeded') ||
          error.message.startsWith('GitHub API Error')) {
        throw error;
      }
    }
    // Otherwise, this is a network or other error
    throw new Error(`Network or other error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Search GitHub repositories
export async function searchRepositories(args: unknown) {
  try {
    const parsed = SearchRepositoriesSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments for search_repositories: ${JSON.stringify(parsed.error)}`);
    }

    const { query, page = 1, perPage = 10 } = parsed.data;
    
    // URL encode query
    const encodedQuery = encodeURIComponent(query);
    
    const endpoint = `/search/repositories?q=${encodedQuery}&page=${page}&per_page=${perPage}`;
    
    const data = await githubFetch(endpoint);
    
    logInfo(`GitHub repositories search completed: ${query}`);
    
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError('Error in searchRepositories', error instanceof Error ? error : new Error(errorMessage));
    throw error;
  }
}

// Get file contents from a GitHub repository
export async function getFileContents(args: unknown) {
  try {
    const parsed = GetFileContentsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments for get_file_contents: ${JSON.stringify(parsed.error)}`);
    }

    const { owner, repo, path, branch } = parsed.data;
    
    // Build URL with branch parameter if provided
    let endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    if (branch) {
      endpoint += `?ref=${branch}`;
    }
    
    const data = await githubFetch(endpoint);
    
    // If it's a directory, return the directory listing
    if (Array.isArray(data)) {
      logInfo(`GitHub directory listing retrieved: ${owner}/${repo}/${path}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
    
    // If it's a file, decode the content
    if (data.content && data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      // Create a result object with metadata and content
      const result = {
        name: data.name,
        path: data.path,
        sha: data.sha,
        size: data.size,
        url: data.html_url,
        content: content
      };
      
      logInfo(`GitHub file contents retrieved: ${owner}/${repo}/${path}`);
      
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
    
    // Handle other cases like symlinks or submodules
    logInfo(`GitHub file metadata retrieved: ${owner}/${repo}/${path}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError('Error in getFileContents', error instanceof Error ? error : new Error(errorMessage));
    throw error;
  }
}

// Create a GitHub issue
export async function createIssue(args: unknown) {
  try {
    const parsed = CreateIssueSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments for create_issue: ${JSON.stringify(parsed.error)}`);
    }

    const { owner, repo, title, body, labels, assignees } = parsed.data;
    
    const endpoint = `/repos/${owner}/${repo}/issues`;
    
    const requestBody = {
      title,
      body,
      labels,
      assignees
    };
    
    const data = await githubFetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    logInfo(`GitHub issue created: ${owner}/${repo}#${data.number}`);
    
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError('Error in createIssue', error instanceof Error ? error : new Error(errorMessage));
    throw error;
  }
}

// Get a GitHub issue
export async function getIssue(args: unknown) {
  try {
    const parsed = GetIssueSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments for get_issue: ${JSON.stringify(parsed.error)}`);
    }

    const { owner, repo, issue_number } = parsed.data;
    
    const endpoint = `/repos/${owner}/${repo}/issues/${issue_number}`;
    
    const data = await githubFetch(endpoint);
    
    logInfo(`GitHub issue retrieved: ${owner}/${repo}#${issue_number}`);
    
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError('Error in getIssue', error instanceof Error ? error : new Error(errorMessage));
    throw error;
  }
}
