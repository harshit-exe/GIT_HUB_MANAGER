/**
 * 📦 GitHub Manager Modules - Main Export File
 *
 * Import everything you need from this single file:
 *
 * ```typescript
 * import {
 *   createGitHubManager,
 *   createGitHubAuth,
 *   GitHubManager,
 *   GitHubAuth
 * } from './modules';
 * ```
 */

// Core Classes
export { GitHubManager, createGitHubManager } from './GitHubManager';
export { GitHubAuth, createGitHubAuth, createGitHubAuthRoutes } from './GitHubAuth';

// Types for external use
export type {
  GitHubConfig,
  IssueCreationOptions,
  CreatedIssue,
} from './GitHubManager';

export type {
  GitHubAuthConfig,
  AuthenticatedUser,
  AuthenticatedRequest,
} from './GitHubAuth';

// Common interfaces that users might need
export interface QuickSetupConfig {
  githubClientId: string;
  githubClientSecret: string;
  callbackUrl: string;
  clientUrl: string;
  scopes?: string[];
}

/**
 * 🚀 Quick setup function for Express.js applications
 *
 * This function sets up both authentication and issue management
 * with sensible defaults.
 */
export function setupGitHubManager(config: QuickSetupConfig) {
  const auth = createGitHubAuth({
    clientId: config.githubClientId,
    clientSecret: config.githubClientSecret,
    callbackUrl: config.callbackUrl,
    scopes: config.scopes || ['repo', 'user'],
  });

  const authRoutes = createGitHubAuthRoutes(auth, config.clientUrl);

  return {
    auth,
    authRoutes,
    createManager: (token: string) => createGitHubManager(token),
    middleware: auth.middleware(),
  };
}

/**
 * 🎯 Issue type helpers for better DX
 */
export const IssueTypes = {
  TASK: 'TASK' as const,
  FEATURE: 'FEATURE' as const,
  BUG: 'BUG' as const,
  EPIC: 'EPIC' as const,
} as const;

export const IssuePriorities = {
  LOW: 'LOW' as const,
  MEDIUM: 'MEDIUM' as const,
  HIGH: 'HIGH' as const,
  CRITICAL: 'CRITICAL' as const,
} as const;

/**
 * 🔧 Utility functions
 */
export const GitHubUtils = {
  /**
   * Parse project ID from various formats
   */
  parseProjectId: (input: string): { owner: string; repo: string } => {
    const normalized = input.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const [owner, repo] = normalized.split('/');

    if (!owner || !repo) {
      throw new Error('Invalid project ID format. Expected: "owner/repo" or GitHub URL');
    }

    return { owner, repo };
  },

  /**
   * Generate branch name preview
   */
  previewBranchName: (type: keyof typeof IssueTypes, title: string): string => {
    const sanitized = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    const prefixes = {
      TASK: 'task',
      FEATURE: 'feature',
      BUG: 'hotfix',
      EPIC: 'epic',
    };

    return `${prefixes[type]}/${sanitized || 'new_issue'}`;
  },

  /**
   * Validate issue creation options
   */
  validateIssueOptions: (options: Partial<IssueCreationOptions>): string[] => {
    const errors: string[] = [];

    if (!options.projectId) errors.push('projectId is required');
    if (!options.title?.trim()) errors.push('title is required');
    if (!options.type) errors.push('type is required');
    if (!options.priority) errors.push('priority is required');
    if (!options.reporterId?.trim()) errors.push('reporterId is required');

    // Validate project ID format
    if (options.projectId) {
      try {
        GitHubUtils.parseProjectId(options.projectId);
      } catch (error) {
        errors.push('Invalid projectId format');
      }
    }

    return errors;
  },
};

// Default export for convenience
export default {
  GitHubManager,
  GitHubAuth,
  createGitHubManager,
  createGitHubAuth,
  createGitHubAuthRoutes,
  setupGitHubManager,
  IssueTypes,
  IssuePriorities,
  GitHubUtils,
};