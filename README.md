# GitHub Manager

A comprehensive GitHub repository management application with enhanced project management features. This application allows you to view all your GitHub repositories, manage branches and contributors, and create issues with automatic branch and pull request creation.

## Features

- **GitHub OAuth Authentication** - Secure login with your GitHub account
- **Repository Management** - View all your repositories with detailed information
- **Branch & Contributor Overview** - See all branches, contributors, and recent commits
- **Advanced Issue Creation** - Create issues with:
  - Multiple issue types (Task, Feature, Bug/Hotfix, Epic)
  - Priority levels (Low, Medium, High, Critical)
  - Assignee selection from repository contributors
  - Estimated hours and due dates
  - Custom labels
  - Work Breakdown Structure support
- **Automatic Branch Creation** - Creates branches with naming conventions:
  - `feature/` for new features
  - `hotfix/` for bug fixes
  - `task/` for general tasks
  - `epic/` for large initiatives
- **Pull Request Integration** - Automatically creates draft PRs linked to issues
- **Issue Tracking** - Unique issue keys (e.g., PROJ-123) for better tracking

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Authentication**: GitHub OAuth
- **API Integration**: GitHub REST API via Octokit
- **Styling**: CSS with utility classes
- **Build Tools**: Vite, TypeScript compiler

## Prerequisites

- Node.js 18+ installed
- GitHub account
- GitHub OAuth App (for authentication)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd github-manager
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:
```bash
npm run install:all
```

Or install them separately:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 3. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: `GitHub Manager`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Note down the Client ID and Client Secret

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 5. Run the Application

Development mode (runs both frontend and backend):
```bash
npm run dev
```

Or run separately:

Backend:
```bash
cd backend && npm run dev
```

Frontend:
```bash
cd frontend && npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## Usage

1. **Login**: Click "Login with GitHub" to authenticate
2. **Browse Repositories**: View all your repositories on the dashboard
3. **Repository Details**: Click "Manage" on any repository to see:
   - Repository statistics and information
   - All branches with protection status
   - Contributors and their contribution counts
   - Recent commits with author information
   - Existing issues and pull requests
4. **Create Issues**: Click "Create Issue" to open the issue creation modal:
   - Fill in title, description, type, and priority
   - Select reporter and assignees from contributors
   - Set estimated hours and due date
   - Add custom labels
   - The system will automatically create a new branch and draft PR

## API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `GET /api/auth/verify` - Verify authentication token

### GitHub Integration
- `GET /api/github/repositories` - Get user repositories
- `GET /api/github/repositories/:owner/:repo` - Get repository details
- `GET /api/github/repositories/:owner/:repo/branches` - Get branches
- `GET /api/github/repositories/:owner/:repo/contributors` - Get contributors
- `GET /api/github/repositories/:owner/:repo/commits` - Get recent commits
- `GET /api/github/repositories/:owner/:repo/issues` - Get issues
- `GET /api/github/repositories/:owner/:repo/pulls` - Get pull requests
- `POST /api/github/repositories/:owner/:repo/branches` - Create new branch

### Issue Management
- `POST /api/issues/create` - Create issue with branch and PR

## Project Structure

```
├── backend/               # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── types/        # TypeScript type definitions
│   │   └── index.ts      # Server entry point
│   ├── dist/             # Backend build output
│   ├── package.json      # Backend dependencies
│   ├── tsconfig.json     # Backend TypeScript config
│   └── .env              # Backend environment variables
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # React hooks
│   │   ├── services/     # API service functions
│   │   ├── types/        # TypeScript type definitions
│   │   └── main.tsx      # Frontend entry point
│   ├── dist/             # Frontend build output
│   ├── package.json      # Frontend dependencies
│   ├── tsconfig.json     # Frontend TypeScript config
│   └── vite.config.ts    # Vite config
├── package.json          # Root package.json for scripts
└── README.md
```

## Key Components

### UI Components (Reusable)
- `Button` - Styled button with variants and loading states
- `Modal` - Accessible modal with keyboard navigation
- `Card` - Container component with header and content sections
- `Input`, `Textarea`, `Select` - Form components with validation

### Pages
- `Login` - GitHub OAuth authentication
- `Dashboard` - Repository listing with search
- `RepositoryDetails` - Detailed repository view with tabs
- `AuthSuccess` - OAuth callback handler

### Services
- `authApi` - Authentication operations
- `githubApi` - GitHub API integration
- `issueApi` - Issue creation and management

## Features in Detail

### Issue Creation Workflow
1. User fills out the comprehensive issue form
2. System generates appropriate branch name based on issue type
3. Creates new branch from main/default branch
4. Creates GitHub issue with all specified details
5. Generates unique issue key (e.g., REPO-123)
6. Creates draft pull request linking to the issue
7. Returns complete information about created resources

### Branch Naming Convention
- **Features**: `feature/login_page`
- **Hotfixes**: `hotfix/signup_bug`
- **Tasks**: `task/update_documentation`
- **Epics**: `epic/user_management`

### Security
- GitHub OAuth for secure authentication
- Token-based API authentication
- No storage of sensitive GitHub credentials
- CORS protection for cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.