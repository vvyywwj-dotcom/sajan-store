import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); // for base64 images / SS

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@sajanstore.com';
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      name: 'Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'sajan123',
      isAdmin: true,
    });
    console.log('Admin user created:', email);
  }
}

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
