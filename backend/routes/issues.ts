import express from 'express';
import { Octokit } from '@octokit/rest';
import { authMiddleware } from '../middleware/auth';
import { CreateIssueRequest, IssueType } from '../../types';

const router = express.Router();

router.use(authMiddleware);

function generateBranchName(type: IssueType, title: string): string {
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);

  const prefix = {
    [IssueType.FEATURE]: 'feature',
    [IssueType.BUG]: 'hotfix',
    [IssueType.TASK]: 'task',
    [IssueType.EPIC]: 'epic',
  };

  return `${prefix[type]}/${sanitizedTitle}`;
}

function generateIssueKey(projectId: string, issueNumber: number): string {
  const projectPrefix = projectId.toUpperCase().substring(0, 4);
  return `${projectPrefix}-${issueNumber}`;
}

router.post('/create', async (req, res) => {
  const {
    projectId,
    title,
    description,
    type,
    priority,
    labels = [],
    reporterId,
    assigneeIds = [],
    estimatedHours,
    dueDate,
  }: CreateIssueRequest = req.body;

  const [owner, repo] = projectId.split('/');

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const branchName = generateBranchName(type, title);

    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: (await octokit.rest.git.getRef({
        owner,
        repo,
        ref: 'heads/main',
      })).data.object.sha,
    });

    const issueLabels = [
      ...labels,
      type.toLowerCase(),
      priority.toLowerCase(),
    ];

    const assignees = assigneeIds.length > 0 ? assigneeIds : [reporterId];

    const issueBody = `
**Description:**
${description || 'No description provided'}

**Type:** ${type}
**Priority:** ${priority}
**Estimated Hours:** ${estimatedHours || 'Not specified'}
**Due Date:** ${dueDate ? new Date(dueDate).toLocaleDateString() : 'Not specified'}

**Branch:** \`${branchName}\`

---
*This issue was created through GitHub Manager*
    `.trim();

    const { data: issue } = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body: issueBody,
      labels: issueLabels,
      assignees,
    });

    const issueKey = generateIssueKey(projectId, issue.number);

    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issue.number,
      title: `[${issueKey}] ${title}`,
    });

    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `[${issueKey}] ${title}`,
      head: branchName,
      base: 'main',
      body: `Closes #${issue.number}\n\n${issueBody}`,
      draft: true,
    });

    res.json({
      success: true,
      issue: {
        ...issue,
        key: issueKey,
        branch: branchName,
      },
      pullRequest: pr,
      branch: {
        name: branchName,
        url: `https://github.com/${owner}/${repo}/tree/${branchName}`,
      },
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      error: 'Failed to create issue',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;