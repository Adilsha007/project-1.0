const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: String,
  deliveryDetails: Object,
  products: Array,
  status: {
    type: String,
    enum: [
      'ordered',
      'shipped',
      'in transit',
      'delivered',
      'cancelled',
      'returned',
    ],
    default: 'ordered',
  },
  createdAt: {
    type: String,
    default: new Date().toLocaleDateString(),
  },
  paymentMethod: {
    type: String,
    default: 'COD',
  },
  totalAmt: Number,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
