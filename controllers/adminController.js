const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');

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

exports.checkCoupon = async (req, res, next) => {
  const coupon = await Category.find({ name: req.body.name });
  if (coupon != null) {
    return res.redirect('/admin/viewCoupons');
  }
  next();
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

exports.getAllcategory = async (req, res, next) => {
  const categories = await Category.find();
  req.categories = categories;
  next();
};

exports.checkCategory = async (req, res, next) => {
  const category = await Category.find({ name: req.body.category });

  if (category.length != 0) {
    return res.redirect('/admin/viewCategory');
  }
  next();
};
exports.addCategory = async (req, res, next) => {
  const category = await Category.create({
    name: req.body.category,
    description: req.body.description,
  });

  res.redirect('/admin/viewCategory');
};

exports.getCategories = async (req, res, next) => {
  const categories = await Category.find();
  req.categories = categories;
  next();
};

exports.getAllBanners = async (req, res, next) => {
  const banners = await Banner.find();
  req.banners = banners;
  next();
};

exports.checkBanner = async (req, res, next) => {
  const banner = await Banner.find({ name: req.body.name });

  if (banner.length != 0) {
    return res.redirect('/admin/viewBanners');
  }
  next();
};

exports.addBanner = async (req, res, next) => {
  console.log('adding banner');
  const banner = await Banner.create({
    name: req.body.name,
  });

  let image = req.files.banner;

  image.mv(`./public/images/product/banner/${banner._id}.jpeg`, (err, done) => {
    if (!err) {
      return res.status(201).redirect('/admin/viewBanners');
    }
  });
};

exports.dashboardDetails = async (req, res, next) => {
  const users = await User.find();
  const products = await Product.find();
  const orders = await Order.find();

  let totalCOD = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, paymentMethod: 'COD' } },
    {
      $group: {
        _id: 0,
        total: {
          $sum: '$totalAmt',
        },
      },
    },
  ]);

  let totalOnline = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, paymentMethod: 'Online' } },
    {
      $group: {
        _id: 0,
        total: {
          $sum: '$totalAmt',
        },
      },
    },
  ]);

  let cancelledOrders = await Order.aggregate([
    { $match: { status: 'cancelled' } },
  ]);
  const recentOrders = await Order.aggregate([
    { $sort: { _id: -1 } },
    { $limit: 5 },
  ]);

  const mensWear = await Product.aggregate([
    { $match: { category: "men's wear" } },
  ]);

  const womensWear = await Product.aggregate([
    { $match: { category: "women's wear" } },
  ]);

  const mensAccess = await Product.aggregate([
    { $match: { category: 'men accessories' } },
  ]);

  const womensAccess = await Product.aggregate([
    { $match: { category: 'women accessories' } },
  ]);
  const stocks = await Product.aggregate([
    {
      $project: { _id: 0, name: 1, stock: 1 },
    },
  ]);
  console.log(stocks);
  const revenueFromCOD = totalCOD[0].total;
  const revenueFromOnline = totalOnline[0].total;
  const totalRevenue = revenueFromCOD + revenueFromOnline;
  const totalcancelledOrders = cancelledOrders;

  req.users = users.length;
  req.products = products.length;
  req.orders = orders.length;
  req.revenueFromCOD = revenueFromCOD;
  req.revenueFromOnline = revenueFromOnline;
  req.totalRevenue = totalRevenue;
  req.totalcancelledOrders = totalcancelledOrders;
  req.recentOrders = recentOrders;
  req.mensWear = mensWear.length;
  req.womensWear = womensWear.length;
  req.mensAccess = mensAccess.length;
  req.womensAccess = womensAccess.length;
  req.stocks = stocks;

  next();
};
