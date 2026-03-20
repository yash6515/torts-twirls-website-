const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  category: {
    type: String,
    required: true,
    enum: ['cotton', 'silk', 'linen', 'microfiber', 'printed', 'plain', 'embroidered', 'luxury']
  },
  size: [{ type: String, enum: ['single', 'double', 'queen', 'king', 'super-king'] }],
  color: [String],
  fabric: { type: String, default: '' },
  threadCount: { type: Number, default: 0 },
  features: [String],
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, unique: true },
  tags: [String],
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  soldCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = (total / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
