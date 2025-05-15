import express from 'express';
import dotenv from 'dotenv';
import { connectToDb } from './config/db';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', userRoutes);

connectToDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
