import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Create order (logged in or guest)
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User order history
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin - all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin - approve / reject
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    if (status === 'approved' && order.orderType === 'product') {
      const product = await Product.findById(order.productId);
      if (!product) return res.status(400).json({ message: 'Product missing' });

      const duration = product.durations.id(order.durationId) ||
        product.durations.find((d) => d.label === order.durationLabel);

      if (!duration || !duration.keys || duration.keys.length === 0) {
        return res.status(400).json({ message: 'No keys available for this duration' });
      }

      const key = duration.keys.shift();
      order.keyDelivered = key;
      product.sold = (product.sold || 0) + (order.quantity || 1);
      await product.save();
    }

    if (status === 'approved' && order.orderType === 'reseller') {
      if (order.userId) {
        await User.findByIdAndUpdate(order.userId, { isReseller: true });
      }
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
