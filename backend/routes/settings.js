import express from 'express';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

async function getOrCreate() {
  let s = await Settings.findOne({ key: 'main' });
  if (!s) s = await Settings.create({ key: 'main' });
  return s;
}

// Public settings (safe fields only)
router.get('/public', async (req, res) => {
  try {
    const s = await getOrCreate();
    res.json({
      storeName: s.storeName,
      upiId: s.upiId,
      binanceId: s.binanceId,
      resellerPrice: s.resellerPrice,
      resellerDiscountPercent: s.resellerDiscountPercent,
      saleActive: s.saleActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin get all
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const s = await getOrCreate();
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin update
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const s = await getOrCreate();
    Object.assign(s, req.body);
    await s.save();
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle global sale
router.post('/sale', protect, adminOnly, async (req, res) => {
  try {
    const { active } = req.body;
    const s = await getOrCreate();
    s.saleActive = !!active;
    await s.save();
    res.json({ saleActive: s.saleActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
