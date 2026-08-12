import mongoose from 'mongoose';

const durationSchema = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true },
  keys: [{ type: String }],
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  category: { type: String, default: 'iOS' },
  badge: { type: String, default: 'iOS' },
  sold: { type: Number, default: 0 },
  durations: [durationSchema],
  isOnSale: { type: Boolean, default: false },
  saleDiscountPercent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', productSchema);
