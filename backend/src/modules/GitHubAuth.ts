/**
 * 🔐 GitHub Authentication Module
 *
 * A standalone, reusable module for GitHub OAuth authentication
 * that can be easily integrated into any Express.js application.
 *
 * @author GitHub Manager Team
 * @version 1.0.0
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { Octokit } from '@octokit/rest';

export interface GitHubAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes?: string[];
}

export interface AuthenticatedUser {
  id: string;
  login: string;
  avatar_url: string;
  name: string;
  email: string;
  accessToken?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Main GitHub Authentication class
 */
export class GitHubAuth {
  private config: GitHubAuthConfig;

  constructor(config: GitHubAuthConfig) {
    this.config = {
      scopes: ['repo', 'user'],
      ...config,
    };
  }

  /**
   * 🚀 Generate GitHub OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const scopes = this.config.scopes!.join(' ');
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: scopes,
      ...(state && { state }),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * 🔄 Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return data.access_token;
  }

  /**
   * 👤 Get user information from GitHub using access token
   */
  async getUserInfo(accessToken: string): Promise<AuthenticatedUser> {
    const octokit = new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    return {
      id: user.id.toString(),
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name || user.login,
      email: user.email || '',
      accessToken,
    };
  }

  /**
   * ✅ Verify if an access token is valid
   */
  async verifyToken(accessToken: string): Promise<AuthenticatedUser> {
    try {
      return await this.getUserInfo(accessToken);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * 🛡️ Express middleware for protecting routes
   */
  middleware() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      try {
        const user = await this.verifyToken(token);
        req.user = user;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
    };
  }
}

/**
 * 🔧 Quick factory function for easy instantiation
 */
export function createGitHubAuth(config: GitHubAuthConfig): GitHubAuth {
  return new GitHubAuth(config);
}

/**
 * 🚀 Complete Express route handlers for GitHub OAuth
 *
 * Use these in your Express app for instant GitHub authentication
 */
export function createGitHubAuthRoutes(auth: GitHubAuth, clientUrl: string) {
  return {
    /**
     * GET /auth/github - Initiate OAuth flow
     */
    initiateAuth: (req: Request, res: Response) => {
      const authUrl = auth.getAuthorizationUrl();
      res.redirect(authUrl);
    },

    /**
     * GET /auth/github/callback - Handle OAuth callback
     */
    handleCallback: async (req: Request, res: Response) => {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      try {
        const accessToken = await auth.exchangeCodeForToken(code as string);
        const userData = await auth.getUserInfo(accessToken);

        // Redirect to frontend with token and user data
        const redirectUrl = new URL('/auth/success', clientUrl);
        redirectUrl.searchParams.set('token', accessToken);
        redirectUrl.searchParams.set('user', encodeURIComponent(JSON.stringify(userData)));

        res.redirect(redirectUrl.toString());
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      }
    },

    /**
     * GET /auth/verify - Verify token endpoint
     */
    verifyToken: async (req: Request, res: Response) => {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      try {
        const user = await auth.verifyToken(token);
        res.json(user);
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
    },
  };
}

// Export types for external use
export type { GitHubAuthConfig, AuthenticatedUser, AuthenticatedRequest };