import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import githubRoutes from './routes/github';
import issueRoutes from './routes/issues';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/issues', issueRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'GitHub Manager API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});