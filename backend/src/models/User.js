const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] },
  address: { type: String, default: '' },
}, { _id: false });

const workerInfoSchema = new mongoose.Schema({
  bio: { type: String, default: '' },
  services: [{ type: String }],
  customServices: [{
    name: { type: String, default: '' },
    price: { type: Number, default: 0 },
    _id: false,
  }],
  zone: { type: String, default: '' },
  serviceRadius: { type: Number, default: 10 },
  priceMin: { type: Number, default: 0 },
  priceMax: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: false },
  paymentMethod: {
    cbu: { type: String, default: '' },
    alias: { type: String, default: '' },
  },
  verification: {
    status: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    dniUrl: { type: String, default: '' },
    selfieUrl: { type: String, default: '' },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  stats: {
    completedJobs: { type: Number, default: 0 },
    cancelledJobs: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
  },
  portfolioPhotos: [{ type: String }],
  featuredUntil: { type: Date, default: null },
}, { _id: false });

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth:   { type: String, required: true },
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  photo: { type: String, default: '' },
  role: { type: String, enum: ['client', 'worker', 'admin'], default: 'client' },
  isActive: { type: Boolean, default: true },
  location: locationSchema,
  workerInfo: workerInfoSchema,
  pushSubscriptions: [pushSubscriptionSchema],
}, {
  timestamps: true,
});

userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1, 'workerInfo.isAvailable': 1 });

module.exports = mongoose.model('User', userSchema);
