import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017'; // Local MongoDB URI
const client = new MongoClient(uri);

export const connectToDb = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

export const getDb = () => client.db('node_assignment'); // Database name

