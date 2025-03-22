import { z } from "zod";

// GitHub tool schemas
export const SearchRepositoriesSchema = z.object({
  query: z.string().describe("Search query string following GitHub search syntax"),
  page: z.number().optional().describe("Page number for pagination, default is 1"),
  perPage: z.number().optional().describe("Number of results per page, default is 10"),
});

export const GetFileContentsSchema = z.object({
  owner: z.string().describe("Repository owner username"),
  repo: z.string().describe("Repository name"),
  path: z.string().describe("File path within the repository"),
  branch: z.string().optional().describe("Branch name, defaults to the default branch"),
});

export const CreateIssueSchema = z.object({
  owner: z.string().describe("Repository owner username"),
  repo: z.string().describe("Repository name"),
  title: z.string().describe("Issue title"),
  body: z.string().describe("Issue description body"),
  labels: z.array(z.string()).optional().describe("Labels to apply to the issue"),
  assignees: z.array(z.string()).optional().describe("Usernames of assignees"),
});

export const GetIssueSchema = z.object({
  owner: z.string().describe("Repository owner username"),
  repo: z.string().describe("Repository name"),
  issue_number: z.number().describe("Issue number"),
});
