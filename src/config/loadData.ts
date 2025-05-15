import axios from 'axios';
import { getDb } from './db';
import { User } from './models/User';
import { Post } from './models/Post';

export const loadData = async () => {
  try {
    const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
      axios.get('https://jsonplaceholder.typicode.com/users'),
      axios.get('https://jsonplaceholder.typicode.com/posts'),
      axios.get('https://jsonplaceholder.typicode.com/comments'),
    ]);

    const users: User[] = usersResponse.data;
    const postsData = postsResponse.data;
    const commentsData = commentsResponse.data;

    const db = getDb();
    const usersCollection = db.collection('users');
    const postsCollection = db.collection('posts');
    const commentsCollection = db.collection('comments');

    // Prevent duplicates
    if ((await usersCollection.countDocuments()) === 0) {
      await usersCollection.insertMany(users);
    }

    if ((await postsCollection.countDocuments()) === 0) {
      const posts: Post[] = postsData.map((post: any) => {
        const postComments = commentsData.filter((c: any) => c.postId === post.id);
        return { ...post, comments: postComments };
      });

      await postsCollection.insertMany(posts);
    }

    if ((await commentsCollection.countDocuments()) === 0) {
      await commentsCollection.insertMany(commentsData);
    }

    console.log("Data loaded successfully.");
  } catch (err) {
    console.error("Error loading data:", err);
  }
};

