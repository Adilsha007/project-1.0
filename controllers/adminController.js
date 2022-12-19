const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');

exports.getOrders = async (req, res, next) => {
  const orders = await Order.find();

  req.orders = orders;

  next();
};

exports.getAllusers = async (req, res, next) => {
  req.body.users = await User.find();

  next();
};

exports.cancelOrder = async (req, res, next) => {
  const updatedUser = await Order.updateOne(
    { orderId: req.params.orderId },
    { status: 'cancelled' }
  );
  res.redirect(`/admin/viewOrders`);
};

exports.updateOrder = async (req, res, next) => {
  const updatedUser = await Order.updateOne(
    { orderId: req.params.orderId },
    { status: req.body.status }
  );
  res.redirect(`/admin/viewOrders`);
};

exports.createCoupon = async (req, res, next) => {
  const coupon = await Coupon.create({
    name: req.body.name,
    exDate: req.body.exDate,
    minValue: req.body.minValue,
    maxValue: req.body.maxValue,
    discount: req.body.Discount,
  });

  res.redirect('/admin/viewCoupons');
};

exports.getAllcoupon = async (req, res, next) => {
  const coupons = await Coupon.find();
  req.coupons = coupons;
  next();
};

exports.deleteCoupon = async (req, res, next) => {
  const deletedCoupon = await Coupon.findByIdAndDelete(req.params.couponId);
  res.redirect('/admin/viewCoupons');
};
