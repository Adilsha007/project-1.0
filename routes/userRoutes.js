const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const productController = require('../controllers/tourController');
const userHelper = require('../helpers/userHelper');

const router = express.Router();

router
  .route('/signup')
  .get((req, res) => {
    res.render('../views/users/signup.ejs', {
      layout: '../views/layouts/layout.ejs',
    });
  })
  .post(authController.signup);

router.route('/otpVerification').post(userHelper.otpVerification);

router
  .route('/login')
  .get((req, res) => {
    res.render('../views/users/signin.ejs', {
      layout: '../views/layouts/layout.ejs',
    });
  })
  .post(authController.login);

router.route('/logout').get(authController.protec, authController.logout);

router
  .route('/forgetPassword')
  .get((req, res) => {
    res.render('../views/users/lostPassword.ejs', {
      layout: '../views/layouts/layout.ejs',
    });
  })
  .post(authController.forgetPassword);

router
  .route('/resetPassword/:token')
  .get((req, res) => {
    res.render('../views/users/resetPassword.ejs', {
      layout: '../views/layouts/layout.ejs',
    });
  })
  .post(authController.resetPassword);

router
  .route('/updateMyPassword')
  .get(authController.protec, (req, res) => {
    const user = req.user;
    res.render('../views/users/changePassword.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
    });
  })
  .post(authController.protec, authController.updatePassword);

router
  .route('/updateMe')
  .get(authController.protec, (req, res) => {
    const user = req.user;
    res.render('../views/users/updateMe.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
    });
  })
  .post(authController.protec, userController.updateMe);

router.route('/deleteMe').get(authController.protec, userController.deleteMe);

router.get('/', (req, res) => {
  res.redirect('/guesthome');
});

router.get(
  '/guesthome',
  productController.getAllproducts,
  userController.getBanners,
  (req, res) => {
    const products = req.body.products;
    const banners = req.banners;
    res.render('../views/users/homepage.ejs', {
      layout: '../views/layouts/layout.ejs',
      products,
      banners,
    });
  }
);

router
  .route('/homepage')
  .get(
    authController.protec,
    productController.getAllproducts,
    userController.getBanners,
    userController.getCart,
    (req, res) => {
      const user = req.user;
      const products = req.body.products;
      const cartProd = req.products;
      const quantities = req.quantities;
      const banners = req.banners;
      res.render('../views/users/homepage.ejs', {
        layout: '../views/layouts/layout.ejs',
        user,
        products,
        cartProd,
        quantities,
        banners,
      });
    }
  );

router.route('/myAccount').get(authController.protec, (req, res) => {
  const user = req.user;
  res.render('../views/users/account.ejs', {
    layout: '../views/layouts/layout.ejs',
    user,
  });
});

router.route('/myprofile').get(authController.protec, (req, res) => {
  const user = req.user;
  res.render('../views/users/myprofile.ejs', {
    layout: '../views/layouts/layout.ejs',
    user,
  });
});

router
  .route('/checkout')
  .get(authController.protec, userController.getCart, (req, res) => {
    const user = req.user;
    const products = req.products;
    const quantities = req.quantities;

    res.render('../views/users/checkout.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      products,
      quantities,
    });
  });

router
  .route('/addressBook')
  .get(authController.protec, userController.getAddresses, (req, res) => {
    const user = req.user;
    const Addresses = req.Addresses;
    res.render('../views/users/addressBook.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      Addresses,
    });
  });

router
  .route('/addAddress/:id')
  .get(authController.protec, (req, res) => {
    const user = req.user;
    res.render('../views/users/addAddress.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
    });
  })
  .post(userController.addAddress, (req, res, next) => {
    res.redirect('/addressBook');
  });

router
  .route('/editAddress/:addressId/:id')
  .get(authController.protec, userController.getAddress, (req, res) => {
    const user = req.user;
    const Address = req.Address;
    res.render('../views/users/editAddress.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      Address,
    });
  })
  .post(userController.editAddress);

router
  .route('/makeDefaultAddress/:id')
  .get(authController.protec, userController.getAddresses, (req, res) => {
    const user = req.user;
    const Addresses = req.Addresses;
    res.render('../views/users/defaultAddress.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      Addresses,
    });
  })
  .post(userController.makeDefaultAddress, (req, res) => {
    res.redirect('/addressBook');
  });

router
  .route('/changeDefaultAddress/:id')
  .post(userController.makeDefaultAddress, (req, res) => {
    res.redirect('/checkout');
  });

router
  .route('/addNewAddress/:id')
  .post(userController.addAddress, (req, res) => {
    res.redirect('/checkout');
  });

router
  .route('/cart')
  .get(authController.protec, userController.getCart, (req, res, next) => {
    const user = req.user;
    const products = req.products;
    const quantities = req.quantities;

    res.render('../views/users/cart.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      products,
      quantities,
    });
  });

router
  .route('/wishlist')
  .get(authController.protec, userController.getWishlist, (req, res, next) => {
    const user = req.user;
    const products = req.products;

    res.render('../views/users/wishlist.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      products,
    });
  });
router
  .route('/addToCart/:id')
  .get(authController.protec, productController.addToCart);

router
  .route('/addTowishList/:id')
  .get(
    authController.protec,
    productController.getAllproducts,
    productController.addTowishList
  );

router
  .route('/del-cart-prod/:id/:prodId')
  .get(authController.protec, userController.delCartProd);

router
  .route('/removeWishlist/:prodId')
  .get(authController.protec, userController.removeWishlistProd);

router
  .route('/clearCart/:id')
  .get(authController.protec, userController.clearCart, (req, res, next) => {
    res.redirect('/cart');
  });

router
  .route('/clearWishlist')
  .get(
    authController.protec,
    userController.clearWishlist,
    (req, res, next) => {
      res.redirect('/homepage');
    }
  );

router
  .route('/payment/:id/:addressId')
  .post(userController.payment, userController.clearCart, (req, res, next) => {
    const user = req.body.user;
    const order = req.body.order;
    const products = req.products;
    const quantities = req.quantities;

    res.render('../views/users/orderCnfm.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      order,
      products,
      quantities,
    });
  });

router
  .route('/myOrders/:id')
  .get(authController.protec, userController.getOrders, (req, res) => {
    const user = req.user;
    const orders = req.body.orders;
    const products = req.products;
    const quantities = req.quantities;
    res.render('../views/users/myOrders.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      orders,
      products,
      quantities,
    });
  });

router
  .route('/manageOrder/:orderId')
  .get(authController.protec, userController.manageOrder, (req, res) => {
    const user = req.user;
    const order = req.order;
    const products = req.products;
    const quantities = req.quantities;
    res.render('../views/users/manageOrder.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      order,
      products,
      quantities,
    });
  });

router
  .route('/cancelOrder/:orderId')
  .get(authController.protec, userController.cancelOrder);

router
  .route('/singleProduct/:prodId')
  .get(authController.protec, userController.singleProd, (req, res) => {
    const user = req.user;
    const product = req.product;
    res.render('../views/users/singleProduct.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      product,
    });
  });

router.route('/paypal').get(authController.protec, (req, res) => {
  const user = req.body.user;
  const products = req.products;
  const quantities = req.quantities;
  res.render('../views/users/paypal.ejs', {
    layout: '../views/layouts/layout.ejs',
    user,
    products,
    quantities,
  });
});

router
  .route('/paypal/:total')
  .post(authController.protec, userController.paypal);

router
  .route('/paypal/:orderID/capture')
  .post(authController.protec, userController.approval);
router
  .route('/confirmOrder/:total')
  .post(
    authController.protec,
    userController.confirmOrder,
    userController.clearCart,
    (req, res, next) => {
      console.log('entering order list');
      const user = req.body.user;
      const order = req.body.order;
      const products = req.products;
      const quantities = req.quantities;

      res.render('../views/users/orderCnfm.ejs', {
        layout: '../views/layouts/layout.ejs',
        user,
        order,
        products,
        quantities,
      });
    }
  );

router
  .route('/applyCoupon/:total')
  .post(authController.protec, userController.applyCoupon);

router.route('/errorPage').get(authController.protec, (req, res) => {
  res.render('../views/users/404.ejs', { layout: false });
});

router
  .route('/womensWear')
  .get(authController.protec, userController.womensWear, (req, res) => {
    const products = req.products;
    const user = req.user;

    res.render('../views/users/category.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      products,
    });
  });

router
  .route('/mensWear')
  .get(authController.protec, userController.mensWear, (req, res) => {
    const products = req.products;
    const user = req.user;

    res.render('../views/users/category.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      products,
    });
  });

router
  .route('/accessories')
  .get(authController.protec, userController.accessories, (req, res) => {
    const products = req.products;
    const user = req.user;

    res.render('../views/users/category.ejs', {
      layout: '../views/layouts/layout.ejs',
      user,
      products,
    });
  });

module.exports = router;
