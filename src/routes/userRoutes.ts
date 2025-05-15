import { Router, Request, Response } from 'express';
import axios from 'axios';
import { usersCollection, postsCollection, commentsCollection } from '../config/db';
import { User, Comment, Post } from '../types';

const router = Router();

interface JSONPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface JSONPlaceholderComment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

// GET /load - Loads 10 users with their posts and comments
router.get('/load', async (_: Request, res: Response) => {
  try {
    // Fetch users, posts, and comments from JSONPlaceholder
    const { data: users }: { data: User[] } = await axios.get('https://jsonplaceholder.typicode.com/users');
    const { data: posts }: { data: JSONPlaceholderPost[] } = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const { data: comments }: { data: JSONPlaceholderComment[] } = await axios.get('https://jsonplaceholder.typicode.com/comments');
    
    // Limit to first 10 users
    const limitedUsers = users.slice(0, 10);
    const userIds = limitedUsers.map(user => user.id);

    // Filter posts and comments related to the 10 users
    const filteredPosts = posts.filter((post) => userIds.includes(post.userId));
    const postIds = filteredPosts.map((post) => post.id);
    const filteredComments = comments.filter((comment) => postIds.includes(comment.postId));

    // Enrich users with their posts and comments
    const enrichedUsers = limitedUsers.map(user => ({
      ...user,
      posts: filteredPosts
        .filter((post) => post.userId === user.id)
        .map((post) => ({
          ...post,
          comments: filteredComments.filter((comment) => comment.postId === post.id)
        }))
    }));

    // Clear existing data and insert new data
    await Promise.all([
      usersCollection.deleteMany({}),
      postsCollection.deleteMany({}),
      commentsCollection.deleteMany({})
    ]);

    await usersCollection.insertMany(enrichedUsers);
    
    // Return both status and the loaded data
    res.status(200).json({
      status: "SUCCESS",
      message: 'Data loaded successfully into the database',
      data: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// DELETE /users - Delete all users
router.delete('/users', async (_: Request, res: Response) => {
  try {
    await usersCollection.deleteMany({});
    res.status(200).json({ message: 'All users deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

// DELETE /users/:userId - Delete user by ID
router.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await usersCollection.deleteOne({ id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /users/:userId - Get user by ID with posts and comments
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await usersCollection.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /users - Add a new user
router.put('/users', async (req: Request, res: Response) => {
  try {
    const newUser: User = req.body;

    // Validate required fields
    if (!newUser.name || !newUser.email || !newUser.username) {
      return res.status(400).json({ 
          error: 'Name, email, and username are required' 
      });
  }

    const existingUser = await usersCollection.findOne({ email: newUser.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Initialize empty posts array if not provided
    if (!newUser.posts) {
      newUser.posts = [];
    }

    const result = await usersCollection.insertOne(newUser);
        
    res.status(201).json({
        message: 'User created successfully',
        userId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

export default router;
