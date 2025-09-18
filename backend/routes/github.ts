import express from 'express';
import { Octokit } from '@octokit/rest';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/repositories', async (req, res) => {
  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    res.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

router.get('/repositories/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    res.json(repository);
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

router.get('/repositories/:owner/:repo/branches', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: branches } = await octokit.rest.repos.listBranches({
      owner,
      repo,
    });

    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

router.get('/repositories/:owner/:repo/contributors', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo,
    });

    res.json(contributors);
  } catch (error) {
    console.error('Error fetching contributors:', error);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

router.get('/repositories/:owner/:repo/commits', async (req, res) => {
  const { owner, repo } = req.params;
  const { page = 1, per_page = 10 } = req.query;

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      page: parseInt(page as string),
      per_page: parseInt(per_page as string),
    });

    res.json(commits);
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

router.get('/repositories/:owner/:repo/issues', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
    });

    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.get('/repositories/:owner/:repo/pulls', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: pulls } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
    });

    res.json(pulls);
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
});

router.post('/repositories/:owner/:repo/branches', async (req, res) => {
  const { owner, repo } = req.params;
  const { branchName, baseBranch = 'main' } = req.body;

  try {
    const octokit = new Octokit({
      auth: req.user.accessToken,
    });

    const { data: baseRef } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });

    const { data: newBranch } = await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    res.json(newBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

export default router;