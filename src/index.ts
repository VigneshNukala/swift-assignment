import express from 'express';
import { connectToDb, getDb } from './db';
import { loadData } from './loadData';

const app = express();
const port = 3000;

app.use(express.json());

connectToDb().then(() => {
  loadData(); // optional: preload data

  // GET /users/:userId
  app.get('/users/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const db = getDb();

    try {
      const user = await db.collection('users').findOne({ id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const posts = await db.collection('posts').find({ userId }).toArray();

      res.json({ ...user, posts });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });

  // DELETE /users/:userId
  app.delete('/users/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const db = getDb();

    try {
      const userResult = await db.collection('users').deleteOne({ id: userId });

      if (userResult.deletedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const posts = await db.collection('posts').find({ userId }).toArray();
      const postIds = posts.map(post => post.id);

      await db.collection('posts').deleteMany({ userId });
      await db.collection('comments').deleteMany({ postId: { $in: postIds } });

      res.json({ message: 'User and related data deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
});

