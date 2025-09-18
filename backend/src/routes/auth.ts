import express from 'express';
import { Octokit } from '@octokit/rest';

const router = express.Router();

router.get('/github', (_, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const scope = 'repo user';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    const octokit = new Octokit({
      auth: tokenData.access_token,
    });

    const { data: user } = await octokit.rest.users.getAuthenticated();

    const userData = {
      id: user.id.toString(),
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name,
      email: user.email,
      accessToken: tokenData.access_token,
    };

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/success?token=${tokenData.access_token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const octokit = new Octokit({
      auth: token,
    });

    const { data: user } = await octokit.rest.users.getAuthenticated();

    res.json({
      id: user.id.toString(),
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;