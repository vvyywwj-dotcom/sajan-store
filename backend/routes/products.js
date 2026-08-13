import express from 'express';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public - list products (fixed: no memory sort crash)
router.get('/', async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 100 },
    ]).allowDiskUse(true);

    const settings = (await Settings.findOne({ key: 'main' }).lean()) || {};
    res.json({ products, saleActive: settings.saleActive || false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public - single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin - create (reject very large images)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    if (req.body.image && req.body.image.length > 500000) {
      return res.status(400).json({
        message: 'Image too large. Use image under 200–300 KB or an image URL.',
      });
    }
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin - update
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (req.body.image && req.body.image.length > 500000) {
      return res.status(400).json({
        message: 'Image too large. Use image under 200–300 KB or an image URL.',
      });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin - delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin - toggle sale on product
router.patch('/:id/sale', protect, adminOnly, async (req, res) => {
  try {
    const { isOnSale, saleDiscountPercent } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isOnSale, saleDiscountPercent: saleDiscountPercent || 0 },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
