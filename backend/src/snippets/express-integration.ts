/**
 * 🚀 Express.js Integration Snippet
 *
 * Copy and paste this code into your Express.js application
 * to add GitHub Manager functionality instantly.
 */

import express from 'express';
import cors from 'cors';
import { createGitHubAuth, createGitHubAuthRoutes } from '../modules/GitHubAuth';
import { createGitHubManager } from '../modules/GitHubManager';

// ============================================================================
// 1. BASIC SETUP (Copy this to your main app file)
// ============================================================================

const app = express();

// Environment variables you need to set
const config = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  PORT: process.env.PORT || 5000,
};

// Middleware
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// ============================================================================
// 2. GITHUB AUTHENTICATION SETUP
// ============================================================================

// Initialize GitHub authentication
const githubAuth = createGitHubAuth({
  clientId: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  callbackUrl: config.GITHUB_CALLBACK_URL,
  scopes: ['repo', 'user']
});

// Create auth route handlers
const authRoutes = createGitHubAuthRoutes(githubAuth, config.CLIENT_URL);

// Add authentication routes
app.get('/api/auth/github', authRoutes.initiateAuth);
app.get('/api/auth/github/callback', authRoutes.handleCallback);
app.get('/api/auth/verify', authRoutes.verifyToken);

// ============================================================================
// 3. PROTECTED ROUTES WITH GITHUB MANAGER
// ============================================================================

// Apply authentication middleware to protected routes
const authMiddleware = githubAuth.middleware();

// Create issue endpoint
app.post('/api/issues/create', authMiddleware, async (req, res) => {
  try {
    const githubManager = createGitHubManager(req.user.accessToken!);

    const result = await githubManager.createIssueWithBranch({
      projectId: req.body.projectId,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      priority: req.body.priority,
      reporterId: req.body.reporterId,
      assigneeIds: req.body.assigneeIds,
      labels: req.body.labels,
      estimatedHours: req.body.estimatedHours,
      actualHours: req.body.actualHours,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      epicId: req.body.epicId,
      parentId: req.body.parentId,
      wbsStructure: req.body.wbsStructure,
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      error: 'Failed to create issue',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get repositories endpoint
app.get('/api/github/repositories', authMiddleware, async (req, res) => {
  try {
    const githubManager = createGitHubManager(req.user.accessToken!);
    const repositories = await githubManager.getRepositories();
    res.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get contributors endpoint
app.get('/api/github/repositories/:owner/:repo/contributors', authMiddleware, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const githubManager = createGitHubManager(req.user.accessToken!);
    const contributors = await githubManager.getContributors(owner, repo);
    res.json(contributors);
  } catch (error) {
    console.error('Error fetching contributors:', error);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

// ============================================================================
// 4. START SERVER
// ============================================================================

app.listen(config.PORT, () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
  console.log(`📝 Create issues at: http://localhost:${config.PORT}/api/issues/create`);
  console.log(`🔐 GitHub OAuth at: http://localhost:${config.PORT}/api/auth/github`);
});

export { app, githubAuth, config };