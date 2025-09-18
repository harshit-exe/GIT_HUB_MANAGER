import axios from 'axios';
import type {
  Repository,
  Branch,
  Contributor,
  Commit,
  GitHubIssue,
  PullRequest,
  CreateIssueRequest,
  User
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('github_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  loginWithGitHub: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  verifyToken: async (): Promise<User> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

export const githubApi = {
  getRepositories: async (): Promise<Repository[]> => {
    const response = await api.get('/github/repositories');
    return response.data;
  },

  getRepository: async (owner: string, repo: string): Promise<Repository> => {
    const response = await api.get(`/github/repositories/${owner}/${repo}`);
    return response.data;
  },

  getBranches: async (owner: string, repo: string): Promise<Branch[]> => {
    const response = await api.get(`/github/repositories/${owner}/${repo}/branches`);
    return response.data;
  },

  getContributors: async (owner: string, repo: string): Promise<Contributor[]> => {
    const response = await api.get(`/github/repositories/${owner}/${repo}/contributors`);
    return response.data;
  },

  getCommits: async (owner: string, repo: string, page = 1): Promise<Commit[]> => {
    const response = await api.get(`/github/repositories/${owner}/${repo}/commits`, {
      params: { page, per_page: 10 }
    });
    return response.data;
  },

  getIssues: async (owner: string, repo: string): Promise<GitHubIssue[]> => {
    const response = await api.get(`/github/repositories/${owner}/${repo}/issues`);
    return response.data;
  },

  getPullRequests: async (owner: string, repo: string): Promise<PullRequest[]> => {
    const response = await api.get(`/github/repositories/${owner}/${repo}/pulls`);
    return response.data;
  },

  createBranch: async (owner: string, repo: string, branchName: string, baseBranch = 'main') => {
    const response = await api.post(`/github/repositories/${owner}/${repo}/branches`, {
      branchName,
      baseBranch,
    });
    return response.data;
  },
};

export const issueApi = {
  createIssue: async (issueData: CreateIssueRequest) => {
    const response = await api.post('/issues/create', issueData);
    return response.data;
  },
};

export default api;