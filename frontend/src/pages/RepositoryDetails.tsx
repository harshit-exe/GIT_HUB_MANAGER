import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { githubApi } from '../services/api';
import {
  Repository,
  Branch,
  Contributor,
  Commit,
  GitHubIssue,
  PullRequest
} from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import CreateIssueModal from '../components/CreateIssueModal';

export default function RepositoryDetails() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'contributors' | 'commits' | 'issues' | 'prs'>('overview');
  const [showCreateIssue, setShowCreateIssue] = useState(false);

  useEffect(() => {
    if (owner && repo) {
      loadRepositoryData();
    }
  }, [owner, repo]);

  const loadRepositoryData = async () => {
    if (!owner || !repo) return;

    try {
      setLoading(true);
      const [repoData, branchesData, contributorsData, commitsData, issuesData, prsData] = await Promise.all([
        githubApi.getRepository(owner, repo),
        githubApi.getBranches(owner, repo),
        githubApi.getContributors(owner, repo),
        githubApi.getCommits(owner, repo),
        githubApi.getIssues(owner, repo),
        githubApi.getPullRequests(owner, repo),
      ]);

      setRepository(repoData);
      setBranches(branchesData);
      setContributors(contributorsData);
      setCommits(commitsData);
      setIssues(issuesData);
      setPullRequests(prsData);
    } catch (error) {
      console.error('Error loading repository data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCreated = () => {
    setShowCreateIssue(false);
    loadRepositoryData();
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <div className="loading mr-2"></div>
          <span>Loading repository details...</span>
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="container py-8">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Repository not found.</p>
            <Link to="/dashboard" className="btn btn-primary mt-4">
              Back to Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'branches', label: 'Branches', count: branches.length },
    { id: 'contributors', label: 'Contributors', count: contributors.length },
    { id: 'commits', label: 'Recent Commits', count: commits.length },
    { id: 'issues', label: 'Issues', count: issues.length },
    { id: 'prs', label: 'Pull Requests', count: pullRequests.length },
  ] as const;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
              <span className="mx-2">/</span>
              <span>{repository.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {repository.name}
              {repository.private && (
                <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
                  Private
                </span>
              )}
            </h1>
            {repository.description && (
              <p className="text-gray-600 mt-2">{repository.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="success"
              onClick={() => setShowCreateIssue(true)}
            >
              Create Issue
            </Button>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Repository Stats</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{repository.stargazers_count}</div>
                  <div className="text-sm text-gray-500">Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{repository.forks_count}</div>
                  <div className="text-sm text-gray-500">Forks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{issues.length}</div>
                  <div className="text-sm text-gray-500">Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{pullRequests.length}</div>
                  <div className="text-sm text-gray-500">Pull Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Repository Info</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Primary Language:</span>
                  <span className="ml-2 text-gray-600">{repository.language || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-medium">Default Branch:</span>
                  <span className="ml-2 text-gray-600">{repository.default_branch}</span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(repository.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(repository.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'branches' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Branches ({branches.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {branches.map((branch) => (
                <div key={branch.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <span className="font-medium">{branch.name}</span>
                    {branch.name === repository.default_branch && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                    {branch.protected && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Protected
                      </span>
                    )}
                  </div>
                  <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {branch.commit.sha.substring(0, 7)}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'contributors' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Contributors ({contributors.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contributors.map((contributor) => (
                <div key={contributor.id} className="flex items-center p-3 border rounded-lg">
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium">{contributor.login}</div>
                    <div className="text-sm text-gray-500">
                      {contributor.contributions} contributions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'commits' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Commits</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commits.map((commit) => (
                <div key={commit.sha} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {commit.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <img
                          src={commit.author?.avatar_url}
                          alt={commit.author?.login}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <span className="mr-3">{commit.author?.login || commit.commit.author.name}</span>
                        <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {commit.sha.substring(0, 7)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'issues' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Issues ({issues.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.number} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      #{issue.number} {issue.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      issue.state === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {issue.state}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{issue.body}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Created {new Date(issue.created_at).toLocaleDateString()}</span>
                    {issue.assignees.length > 0 && (
                      <span>• Assigned to {issue.assignees.map(a => a.login).join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'prs' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Pull Requests ({pullRequests.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pullRequests.map((pr) => (
                <div key={pr.number} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      #{pr.number} {pr.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      pr.state === 'open'
                        ? 'bg-green-100 text-green-800'
                        : pr.state === 'merged'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pr.state}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{pr.body}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{pr.head.ref} → {pr.base.ref}</span>
                    <span>• Created {new Date(pr.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateIssue && (
        <CreateIssueModal
          isOpen={showCreateIssue}
          onClose={() => setShowCreateIssue(false)}
          repository={repository}
          contributors={contributors}
          onIssueCreated={handleIssueCreated}
        />
      )}
    </div>
  );
}