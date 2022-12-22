const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const productController = require('../controllers/tourController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/', adminController.dashboardDetails, (req, res) => {
  const users = req.users;
  const products = req.products;
  const orders = req.orders;
  const revenueFromCOD = req.revenueFromCOD;
  const revenueFromOnline = req.revenueFromOnline;
  const totalRevenue = req.totalRevenue;
  const totalcancelledOrders = req.totalcancelledOrders;
  const recentOrders = req.recentOrders;
  const mensWear = req.mensWear;
  const womensWear = req.womensWear;
  const mensAccess = req.mensAccess;
  const womensAccess = req.womensAccess;
  const stocks = req.stocks;
  // console.log(
  //   users,
  //   products,
  //   orders,
  //   revenueFromCOD,
  //   revenueFromOnline,
  //   totalRevenue,
  //   totalcancelledOrders,
  //   chartArray
  // );
  res.render('../views/admin/adminDash.ejs', {
    layout: '../views/layouts/adminLay.ejs',
    users,
    products,
    orders,
    revenueFromCOD,
    revenueFromOnline,
    totalRevenue,
    totalcancelledOrders,
    recentOrders,
    mensWear,
    mensAccess,
    womensWear,
    womensAccess,
    stocks,
  });
});

router
  .route('/addProduct')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.getCategories,
    (req, res) => {
      let user = req.user;
      let categories = req.categories;
      res.render('../views/admin/addProd.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        user,
        categories,
      });
    }
  )
  .post(authController.protec, productController.createProduct);

router
  .route('/viewProduct')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    productController.getAllproducts,
    (req, res) => {
      let products = req.body.products;
      res.render('../views/admin/viewProd.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        products,
      });
    }
  )
  .post(authController.protec, productController.createProduct);

router
  .route('/viewUsers')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.getAllusers,
    (req, res) => {
      let users = req.body.users;
      res.render('../views/admin/viewUser.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        users,
      });
    }
  );

router.route('/blockUser/:id').get();

router
  .route('/editProduct/:id')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    productController.getProduct,
    (req, res) => {
      let product = req.body.product;
      res.render('../views/admin/editProd.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        product,
      });
    }
  )
  .post(authController.protec, productController.updateProduct);

router
  .route('/deleteProduct/:id')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

router
  .route('/viewOrders')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.getOrders,
    (req, res) => {
      let orders = req.orders;
      res.render('../views/admin/viewOrders.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        orders,
      });
    }
  );

router
  .route('/singleOrder/:orderId')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    userController.manageOrder,
    (req, res) => {
      const user = req.user;
      const order = req.order;
      const products = req.products;
      const quantities = req.quantities;
      res.render('../views/admin/singleOrder.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        user,
        order,
        products,
        quantities,
      });
    }
  );

router
  .route('/cancelOrder/:orderId')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.cancelOrder
  );

router
  .route('/updateOrder/:orderId')
  .post(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.updateOrder
  );

router
  .route('/viewCoupons')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.getAllcoupon,
    (req, res) => {
      const coupons = req.coupons;
      res.render('../views/admin/viewCoupons.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        coupons,
      });
    }
  );

router
  .route('/addCoupon')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    (req, res) => {
      res.render('../views/admin/addCoupon.ejs', {
        layout: '../views/layouts/adminLay.ejs',
      });
    }
  )
  .post(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.checkCoupon,
    adminController.createCoupon
  );

router
  .route('/deleteCoupon/:couponId')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.deleteCoupon
  );

router
  .route('/viewCategory')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.getAllcategory,
    (req, res) => {
      const categories = req.categories;
      res.render('../views/admin/categorylist.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        categories,
      });
    }
  );

router
  .route('/addCategory')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    (req, res) => {
      res.render('../views/admin/addCategory.ejs', {
        layout: '../views/layouts/adminLay.ejs',
      });
    }
  )
  .post(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.checkCategory,
    adminController.addCategory
  );

router
  .route('/viewSalesReport')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    productController.getAllproducts,
    (req, res) => {
      let products = req.body.products;
      res.render('../views/admin/salesReport.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        products,
      });
    }
  );

router
  .route('/viewBanners')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.getAllBanners,
    (req, res) => {
      let banners = req.banners;
      res.render('../views/admin/viewBanners.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        banners,
      });
    }
  );
router
  .route('/addBanner')
  .post(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.checkBanner,
    adminController.addBanner
  );
// router.route('/')
//     .get(userController.getAllusers)
//     .post(userController.createUser)

module.exports = router;
