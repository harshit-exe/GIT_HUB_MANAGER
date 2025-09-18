/**
 * 🚀 GitHub Manager Module
 *
 * A standalone, reusable module for GitHub repository management
 * with enhanced issue creation, branch management, and PR automation.
 *
 * @author GitHub Manager Team
 * @version 1.0.0
 * @license MIT
 */

import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  accessToken: string;
}

export interface IssueCreationOptions {
  projectId: string; // owner/repo format
  title: string;
  description?: string;
  type: 'TASK' | 'FEATURE' | 'BUG' | 'EPIC';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reporterId: string;
  assigneeIds?: string[];
  labels?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  epicId?: string;
  parentId?: string;
  wbsStructure?: any;
}

export interface CreatedIssue {
  success: boolean;
  issue: any;
  branch: {
    name: string;
    url: string;
  };
  pullRequest?: any;
  hasInitialCommit: boolean;
  notes: string;
}

/**
 * Main GitHub Manager class for repository operations
 */
export class GitHubManager {
  private octokit: Octokit;

  constructor(config: GitHubConfig) {
    this.octokit = new Octokit({
      auth: config.accessToken,
    });
  }

  /**
   * Generate a unique branch name based on issue type and title
   */
  private generateBranchName(type: string, title: string, timestamp?: number): string {
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    const prefixMap = {
      FEATURE: 'feature',
      BUG: 'hotfix',
      TASK: 'task',
      EPIC: 'epic',
    };

    const prefix = prefixMap[type as keyof typeof prefixMap] || 'task';
    const baseName = sanitizedTitle || 'new_issue';
    const suffix = timestamp ? `_${timestamp}` : '';

    return `${prefix}/${baseName}${suffix}`;
  }

  /**
   * Generate a unique issue key for tracking
   */
  private generateIssueKey(projectId: string, issueNumber: number): string {
    const projectPrefix = projectId.toUpperCase().substring(0, 4);
    return `${projectPrefix}-${issueNumber}`;
  }

  /**
   * Create a unique branch, handling name conflicts automatically
   */
  private async createUniqueBranch(
    owner: string,
    repo: string,
    type: string,
    title: string,
    baseBranch = 'main'
  ) {
    let branchName = this.generateBranchName(type, title);
    let attempt = 0;
    const maxAttempts = 5;

    // Get base branch reference
    let baseRef;
    try {
      const response = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });
      baseRef = response.data;
    } catch (error: any) {
      if (error.status === 404) {
        // Try 'master' as fallback
        try {
          const response = await this.octokit.rest.git.getRef({
            owner,
            repo,
            ref: `heads/master`,
          });
          baseRef = response.data;
          baseBranch = 'master';
        } catch (masterError: any) {
          if (masterError.status === 404) {
            throw new Error(
              'Repository has no main branch. Please ensure the repository has at least one commit and a default branch (main or master).'
            );
          }
          throw masterError;
        }
      } else {
        throw error;
      }
    }

    // Find unique branch name
    while (attempt < maxAttempts) {
      try {
        await this.octokit.rest.git.getRef({
          owner,
          repo,
          ref: `heads/${branchName}`,
        });
        // Branch exists, try with timestamp
        const timestamp = Date.now() + attempt;
        branchName = this.generateBranchName(type, title, timestamp);
        attempt++;
      } catch (error: any) {
        if (error.status === 404) {
          // Branch doesn't exist, we can use this name
          break;
        }
        throw error;
      }
    }

    if (attempt >= maxAttempts) {
      throw new Error('Unable to generate unique branch name after multiple attempts');
    }

    // Create the new branch
    const { data: newBranch } = await this.octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    return { branchName, newBranch, baseBranch };
  }

  /**
   * Create an initial commit on the branch with tracking file
   */
  private async createInitialCommit(
    owner: string,
    repo: string,
    branchName: string,
    issueKey: string,
    title: string
  ) {
    try {
      // Get branch reference
      const { data: branchRef } = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branchName}`,
      });

      // Get current commit
      const { data: currentCommit } = await this.octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: branchRef.object.sha,
      });

      // Create tracking file
      const fileName = `ISSUE_${issueKey}.md`;
      const fileContent = `# ${issueKey}: ${title}

This branch was created for issue: ${title}

## Issue Details
- Issue Key: ${issueKey}
- Branch: ${branchName}
- Created: ${new Date().toISOString()}

## TODO
- [ ] Implement the changes for this issue
- [ ] Add tests
- [ ] Update documentation
- [ ] Ready for review

---
*This file was auto-generated by GitHub Manager*
`;

      // Create blob
      const { data: blob } = await this.octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(fileContent).toString('base64'),
        encoding: 'base64',
      });

      // Create tree
      const { data: tree } = await this.octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: currentCommit.tree.sha,
        tree: [
          {
            path: fileName,
            mode: '100644',
            type: 'blob',
            sha: blob.sha,
          },
        ],
      });

      // Create commit
      const { data: commit } = await this.octokit.rest.git.createCommit({
        owner,
        repo,
        message: `feat: Initialize branch for ${issueKey}

Created initial commit for issue: ${title}

- Added issue tracking file
- Ready for development

Issue: ${issueKey}`,
        tree: tree.sha,
        parents: [currentCommit.sha],
      });

      // Update branch reference
      await this.octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branchName}`,
        sha: commit.sha,
      });

      return commit;
    } catch (error) {
      console.error('Failed to create initial commit:', error);
      return null;
    }
  }

  /**
   * 🎯 Main method: Create a complete issue with branch and PR
   *
   * This is the primary method you'll use in your applications
   */
  async createIssueWithBranch(options: IssueCreationOptions): Promise<CreatedIssue> {
    const {
      projectId,
      title,
      description,
      type,
      priority,
      reporterId,
      assigneeIds = [],
      labels = [],
      estimatedHours,
      actualHours,
      dueDate,
      epicId,
      parentId,
      wbsStructure,
    } = options;

    const [owner, repo] = projectId.split('/');

    try {
      // 1. Create unique branch
      const { branchName, baseBranch } = await this.createUniqueBranch(owner, repo, type, title);

      // 2. Prepare issue data
      const issueLabels = [...labels, type.toLowerCase(), priority.toLowerCase()];
      const assignees = assigneeIds.length > 0 ? assigneeIds : [reporterId];

      const issueBody = `
**Description:**
${description || 'No description provided'}

**Issue Details:**
- **Type:** ${type}
- **Priority:** ${priority}
- **Estimated Hours:** ${estimatedHours || 'Not specified'}
- **Actual Hours:** ${actualHours || 'Not specified'}
- **Due Date:** ${dueDate ? new Date(dueDate).toLocaleDateString() : 'Not specified'}
- **Epic ID:** ${epicId || 'None'}
- **Parent Issue:** ${parentId || 'None'}
- **Reporter:** ${reporterId}

**Work Breakdown Structure:**
${wbsStructure ? JSON.stringify(wbsStructure, null, 2) : 'Not specified'}

**Branch:** \`${branchName}\`

---
*This issue was created through GitHub Manager*
      `.trim();

      // 3. Create GitHub issue
      const { data: issue } = await this.octokit.rest.issues.create({
        owner,
        repo,
        title,
        body: issueBody,
        labels: issueLabels,
        assignees,
      });

      // 4. Generate issue key and update title
      const issueKey = this.generateIssueKey(projectId, issue.number);
      await this.octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issue.number,
        title: `[${issueKey}] ${title}`,
      });

      // 5. Create initial commit
      const initialCommit = await this.createInitialCommit(owner, repo, branchName, issueKey, title);

      // 6. Create pull request (if initial commit successful)
      let pr = null;
      if (initialCommit) {
        try {
          const { data: prData } = await this.octokit.rest.pulls.create({
            owner,
            repo,
            title: `[${issueKey}] ${title}`,
            head: branchName,
            base: baseBranch,
            body: `Closes #${issue.number}\n\n${issueBody}`,
            draft: true,
          });
          pr = prData;
        } catch (prError) {
          console.error('Failed to create PR:', prError);
        }
      }

      return {
        success: true,
        issue: {
          ...issue,
          key: issueKey,
          branch: branchName,
        },
        branch: {
          name: branchName,
          url: `https://github.com/${owner}/${repo}/tree/${branchName}`,
        },
        pullRequest: pr,
        hasInitialCommit: !!initialCommit,
        notes: pr
          ? 'Issue, branch, and pull request created successfully!'
          : 'Issue and branch created successfully. Pull request creation was skipped.',
      };
    } catch (error) {
      throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 📋 Get all repositories for the authenticated user
   */
  async getRepositories() {
    const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    return repos;
  }

  /**
   * 🌿 Get all branches for a repository
   */
  async getBranches(owner: string, repo: string) {
    const { data: branches } = await this.octokit.rest.repos.listBranches({
      owner,
      repo,
    });
    return branches;
  }

  /**
   * 👥 Get all contributors for a repository
   */
  async getContributors(owner: string, repo: string) {
    const { data: contributors } = await this.octokit.rest.repos.listContributors({
      owner,
      repo,
    });
    return contributors;
  }

  /**
   * 📝 Get recent commits for a repository
   */
  async getCommits(owner: string, repo: string, page = 1, perPage = 10) {
    const { data: commits } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      page,
      per_page: perPage,
    });
    return commits;
  }
}

/**
 * 🔧 Quick factory function for easy instantiation
 */
export function createGitHubManager(accessToken: string): GitHubManager {
  return new GitHubManager({ accessToken });
}

// Export types for external use
export type { GitHubConfig, IssueCreationOptions, CreatedIssue };