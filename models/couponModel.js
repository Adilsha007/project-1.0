const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  exDate: String,
  minValue: Number,
  maxValue: Number,
  discount: Number,
  status: {
    type: Boolean,
    default: true,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
