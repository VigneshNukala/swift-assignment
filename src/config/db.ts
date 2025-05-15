import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'node_assignment';

const client = new MongoClient(uri);
let isConnected = false;

export const connectToDb = async () => {
  if (isConnected) return;
  console.log("Connecting to MongoDB...");
  try {
    await client.connect();
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); 
  }
};

const db = client.db(dbName);

export const usersCollection = db.collection('users');
export const postsCollection = db.collection('posts');
export const commentsCollection = db.collection('comments');
