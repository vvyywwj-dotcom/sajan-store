import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  productImage: String,
  durationLabel: String,
  durationId: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  total: Number,
  discountApplied: { type: Number, default: 0 },
  buyer: {
    name: String,
    phone: String,
    telegram: String,
    email: String,
  },
  paymentMethod: { type: String, default: 'upi' },
  paymentSs: String,
  buyerUpiId: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  keyDelivered: String,
  isResellerOrder: { type: Boolean, default: false },
  orderType: { type: String, enum: ['product', 'reseller'], default: 'product' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);
