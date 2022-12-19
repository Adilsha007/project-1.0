const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const productController = require('../controllers/tourController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('../views/admin/adminDash.ejs', {
    layout: '../views/layouts/adminLay.ejs',
  });
});

router
  .route('/addProduct')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    (req, res) => {
      let user = req.user;
      res.render('../views/admin/addProd.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        user,
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
    adminController.createCoupon,
    authController.restrictTo('admin'),
    (req, res) => {
      const coupons = req.coupons;
      res.render('../views/admin/viewCoupons.ejs', {
        layout: '../views/layouts/adminLay.ejs',
        coupons,
      });
    }
  );
router
  .route('/deleteCoupon/:couponId')
  .get(
    authController.protec,
    authController.restrictTo('admin'),
    adminController.deleteCoupon
  );
// router.route('/')
//     .get(userController.getAllusers)
//     .post(userController.createUser)

module.exports = router;
