export interface User {
  id: string;
  login: string;
  avatar_url: string;
  name: string;
  email: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  owner: User;
  html_url: string;
  clone_url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: User;
}

export enum IssueType {
  TASK = 'TASK',
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  EPIC = 'EPIC'
}

export enum IssueStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Issue {
  id: string;
  projectId: string;
  epicId?: string;
  parentId?: string;
  key: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  labels?: string[];
  dueDate?: Date;
  reporterId: string;
  assigneeIds?: string[];
  estimatedHours?: number;
  actualHours?: number;
  wbsStructure?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIssueRequest {
  projectId: string;
  epicId?: string;
  parentId?: string;
  title: string;
  description?: string;
  type: IssueType;
  priority: Priority;
  labels?: string[];
  dueDate?: Date;
  reporterId: string;
  assigneeIds?: string[];
  estimatedHours?: number;
  branchName?: string;
  createPR?: boolean;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  assignees: User[];
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface PullRequest {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  assignees: User[];
}