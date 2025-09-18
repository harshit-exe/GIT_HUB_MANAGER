/**
 * 🎯 Standalone Usage Examples
 *
 * Use GitHub Manager in any Node.js application without Express
 */

import { createGitHubManager, createGitHubAuth } from '../modules';

// ============================================================================
// 1. SIMPLE ISSUE CREATION
// ============================================================================

async function createSimpleIssue() {
  // Initialize with your GitHub access token
  const manager = createGitHubManager('your-github-access-token');

  try {
    const result = await manager.createIssueWithBranch({
      projectId: 'username/repository-name',
      title: 'Implement user authentication',
      description: 'Add JWT-based authentication system',
      type: 'FEATURE',
      priority: 'HIGH',
      reporterId: 'john-doe',
      assigneeIds: ['jane-smith', 'bob-wilson'],
      labels: ['authentication', 'security'],
      estimatedHours: 8,
    });

    console.log('✅ Issue created successfully!');
    console.log('🔗 Issue URL:', result.issue.html_url);
    console.log('🌿 Branch:', result.branch.name);
    console.log('📝 PR:', result.pullRequest?.html_url);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// 2. BATCH ISSUE CREATION
// ============================================================================

async function createMultipleIssues() {
  const manager = createGitHubManager('your-github-access-token');

  const issues = [
    {
      title: 'Setup user registration',
      type: 'TASK' as const,
      priority: 'HIGH' as const,
    },
    {
      title: 'Add password reset functionality',
      type: 'FEATURE' as const,
      priority: 'MEDIUM' as const,
    },
    {
      title: 'Fix login validation bug',
      type: 'BUG' as const,
      priority: 'CRITICAL' as const,
    },
  ];

  for (const issue of issues) {
    try {
      const result = await manager.createIssueWithBranch({
        projectId: 'username/repository-name',
        title: issue.title,
        type: issue.type,
        priority: issue.priority,
        reporterId: 'project-manager',
      });

      console.log(`✅ Created: ${result.issue.key} - ${issue.title}`);
    } catch (error) {
      console.error(`❌ Failed to create: ${issue.title}`, error);
    }
  }
}

// ============================================================================
// 3. COMPLEX ISSUE WITH FULL METADATA
// ============================================================================

async function createComplexIssue() {
  const manager = createGitHubManager('your-github-access-token');

  const result = await manager.createIssueWithBranch({
    projectId: 'company/main-app',
    title: 'Implement advanced user dashboard',
    description: `
## Requirements
- Real-time data visualization
- User preference management
- Mobile-responsive design

## Acceptance Criteria
- [ ] Dashboard loads in under 2 seconds
- [ ] All charts are interactive
- [ ] Works on mobile devices
    `,
    type: 'EPIC',
    priority: 'HIGH',
    reporterId: 'product-owner',
    assigneeIds: ['frontend-dev', 'ux-designer'],
    labels: ['dashboard', 'frontend', 'epic'],
    estimatedHours: 40,
    dueDate: new Date('2024-12-31'),
    epicId: 'EPIC-001',
    wbsStructure: {
      phases: [
        { name: 'Design', duration: '1 week' },
        { name: 'Development', duration: '2 weeks' },
        { name: 'Testing', duration: '3 days' },
      ],
    },
  });

  console.log('📊 Epic created:', result.issue.key);
}

// ============================================================================
// 4. AUTHENTICATION FLOW
// ============================================================================

async function handleAuthentication() {
  const auth = createGitHubAuth({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    callbackUrl: 'http://localhost:3000/callback',
  });

  // Generate authorization URL
  const authUrl = auth.getAuthorizationUrl();
  console.log('🔐 Authorize at:', authUrl);

  // After user authorizes, exchange code for token
  // const accessToken = await auth.exchangeCodeForToken(authCode);

  // Get user information
  // const user = await auth.getUserInfo(accessToken);
  // console.log('👤 Authenticated user:', user.login);
}

// ============================================================================
// 5. REPOSITORY MANAGEMENT
// ============================================================================

async function manageRepositories() {
  const manager = createGitHubManager('your-github-access-token');

  // Get all repositories
  const repos = await manager.getRepositories();
  console.log(`📚 Found ${repos.length} repositories`);

  // Get repository details
  for (const repo of repos.slice(0, 3)) {
    console.log(`\n📂 ${repo.name}:`);

    // Get contributors
    const contributors = await manager.getContributors(repo.owner.login, repo.name);
    console.log(`  👥 ${contributors.length} contributors`);

    // Get branches
    const branches = await manager.getBranches(repo.owner.login, repo.name);
    console.log(`  🌿 ${branches.length} branches`);

    // Get recent commits
    const commits = await manager.getCommits(repo.owner.login, repo.name);
    console.log(`  📝 Last commit: ${commits[0]?.commit.message.slice(0, 50)}...`);
  }
}

// ============================================================================
// 6. ERROR HANDLING
// ============================================================================

async function robustIssueCreation() {
  const manager = createGitHubManager('your-github-access-token');

  try {
    const result = await manager.createIssueWithBranch({
      projectId: 'username/repo',
      title: 'Test issue',
      type: 'TASK',
      priority: 'LOW',
      reporterId: 'tester',
    });

    console.log('✅ Success:', result.notes);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);

      // Handle specific error cases
      if (error.message.includes('Repository has no main branch')) {
        console.log('💡 Tip: Make sure your repository has at least one commit');
      } else if (error.message.includes('Unable to generate unique branch name')) {
        console.log('💡 Tip: Too many similar branches exist, try a different title');
      }
    }
  }
}

// Export examples for testing
export {
  createSimpleIssue,
  createMultipleIssues,
  createComplexIssue,
  handleAuthentication,
  manageRepositories,
  robustIssueCreation,
};