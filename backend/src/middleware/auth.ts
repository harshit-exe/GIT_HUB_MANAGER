import { Request, Response, NextFunction } from 'express';
import { Octokit } from '@octokit/rest';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    login: string;
    avatar_url: string;
    name: string;
    email: string;
    accessToken: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const octokit = new Octokit({
      auth: token,
    });

    const { data: user } = await octokit.rest.users.getAuthenticated();

    req.user = {
      id: user.id.toString(),
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name || user.login,
      email: user.email || '',
      accessToken: token,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}