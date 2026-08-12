import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  storeName: { type: String, default: 'Sajan Store' },
  upiId: { type: String, default: 'sajan@upi' },
  binanceId: { type: String, default: 'sajanbinance' },
  resellerPrice: { type: Number, default: 999 },
  resellerDiscountPercent: { type: Number, default: 10 },
  saleActive: { type: Boolean, default: false },
  telegramBotToken: { type: String, default: '' },
  telegramChatId: { type: String, default: '' },
});

export default mongoose.model('Settings', settingsSchema);
