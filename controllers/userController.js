const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const uuid = require('uuid');
const { CLIENT_ID, APP_SECRET } = process.env;
const fetch = require('node-fetch');
const base = 'https://api-m.sandbox.paypal.com';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createUser = (req, res) => {
  console.log('create user');
  res.status(500).json({
    Status: 'error',
    message: 'This route is under construction',
  });
};
exports.getUser = (req, res) => {
  console.log('create get user');
  res.status(500).json({
    Status: 'error',
    message: 'This route is under construction',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // 1, throw error when try to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update', 400));
  }

  // 2, update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.redirect('/myprofile');
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).redirect('/guesthome');
});

exports.getCart = async (req, res, next) => {
  let user = req.user;
  const quantities = [];

  const products = await Promise.all(
    user.cart.map(async (el) => {
      quantities.push(el.quantity);
      const product = await Product.findById(el.prodId);
      return product;
    })
  );

  req.products = products;
  req.quantities = quantities;

  next();
};

exports.getWishlist = async (req, res, next) => {
  let user = req.user;

  const products = await Promise.all(
    user.wishlist.map(async (el) => {
      const product = await Product.findById(el);
      return product;
    })
  );

  req.products = products;
  next();
};

exports.delCartProd = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $pull: { cart: { prodId: req.params.prodId } } },
    {
      new: true,
      runValidators: true,
    }
  );
  res.redirect('/cart');
};

exports.removeWishlistProd = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { wishlist: req.params.prodId } },
    {
      new: true,
      runValidators: true,
    }
  );
  res.redirect('/wishlist');
};

exports.clearCart = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { cart: [] } },
    {
      new: true,
      runValidators: true,
    }
  );

  next();
};

exports.clearWishlist = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { wishlist: [] } },
    {
      new: true,
      runValidators: true,
    }
  );

  next();
};

exports.addAddress = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  function addressExists(addressId) {
    return user.Address.some(function (el) {
      return el.addressId === addressId;
    });
  }

  if (!addressExists(req.body.addressId)) {
    req.body.addressId = uuid.v1();

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { Address: req.body } },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      $set: { Address: [req.body] },
    });
    console.log(updatedUser);
  }

  next();
};

exports.getAddresses = async (req, res, next) => {
  let user = req.user;
  const Addresses = await Promise.all(
    user.Address.map(async (el) => {
      return el;
    })
  );
  req.Addresses = Addresses;
  next();
};

exports.getAddress = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const Address = await user.Address.find((el) => {
    return el.addressId == req.params.addressId;
  });

  req.Address = Address;

  next();
};

exports.editAddress = async (req, res, next) => {
  const updatedUser = await User.updateOne(
    { _id: req.params.id, 'Address.addressId': req.params.addressId },
    {
      $set: {
        'Address.$.name': req.body.name,
        'Address.$.email': req.body.email,
        'Address.$.phoneNo': req.body.phoneNo,
        'Address.$.address': req.body.address,
        'Address.$.country': req.body.country,
        'Address.$.state': req.body.state,
        'Address.$.town': req.body.town,
        'Address.$.pin': req.body.pin,
      },
    }
  );

  res.redirect('/addressBook');
};

exports.makeDefaultAddress = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  function isDefault() {
    return user.Address.some(function (el) {
      return el.isSelect === true;
    });
  }

  if (isDefault()) {
    const found = user.Address.find((el) => el.isSelect === true);

    const updatedUser = await User.updateOne(
      { _id: req.params.id, 'Address.addressId': found.addressId },
      {
        $set: {
          'Address.$.isSelect': false,
        },
      }
    );
  }

  const updatedUser = await User.updateOne(
    { _id: req.params.id, 'Address.addressId': req.body.default_address },
    {
      $set: {
        'Address.$.isSelect': true,
      },
    }
  );

  next();
};

exports.payment = async (req, res, next) => {
  console.log(req.params);
  const user = await User.findById(req.params.id);

  const found = user.Address.find(
    (el) => el.addressId === req.params.addressId
  );

  const quantities = [];
  let totalAmt = 100;

  const products = await Promise.all(
    user.cart.map(async (el) => {
      quantities.push(el.quantity);
      const product = await Product.findById(el.prodId);
      totalAmt = totalAmt + el.quantity * product.price;
      return product;
    })
  );

  const coupon = await Coupon.findOne({ name: user.currentCoupon });
  if (totalAmt >= coupon.minValue) {
    const discount = (totalAmt * coupon.discount) / 100;
    if (discount < coupon.maxValue) {
      totalAmt = totalAmt - discount;
    } else {
      totalAmt = totalAmt - coupon.maxValue;
    }
  }
  const newId = uuid.v1();

  if (req.body.payment === 'cod') {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { orderId: newId } },
      {
        new: true,
        runValidators: true,
      }
    );

    const newOrder = await Order.create({
      orderId: newId,
      deliveryDetails: found,
      products: user.cart,
      totalAmt: totalAmt,
    });

    req.body.order = newOrder;
    req.body.user = user;
    req.products = products;
    req.quantities = quantities;
  }

  if (req.body.payment === 'paypal') {
    return res.render('../views/users/paypal.ejs', {
      user,
      products,
      quantities,
    });
  }

  next();
};

exports.getOrders = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log(user);
  const orders = await Promise.all(
    user.orderId.map(async (el) => {
      const order = await Order.findOne({ orderId: el });
      return order;
    })
  );
  console.log(orders);
  const quantities = [];

  const products = await Promise.all(
    orders.map(async (el) => {
      const prods = await Promise.all(
        el.products.map(async (ele) => {
          quantities.push(ele.quantity);
          const prod = await Product.findById(ele.prodId);
          return prod;
        })
      );
      return prods;
    })
  );

  req.body.orders = orders;
  req.products = products;
  req.quantities = quantities;

  next();
};

exports.manageOrder = async (req, res, next) => {
  const order = await Order.findOne({ orderId: req.params.orderId });

  const quantities = [];

  const prods = await Promise.all(
    order.products.map(async (ele) => {
      quantities.push(ele.quantity);
      const prod = await Product.findById(ele.prodId);
      return prod;
    })
  );

  req.products = prods;
  req.quantities = quantities;
  req.order = order;
  next();
};

exports.cancelOrder = async (req, res, next) => {
  const updatedUser = await Order.updateOne(
    { orderId: req.params.orderId },
    { status: 'cancelled' }
  );
  res.redirect(`/myOrders/${req.user.id}`);
};

exports.singleProd = async (req, res, next) => {
  const product = await Product.findById(req.params.prodId);

  req.product = product;

  next();
};

// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ':' + APP_SECRET).toString('base64');

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'post',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await response.json();

  return data.access_token;
}

exports.paypal = async (req, res, next) => {
  console.log('paypal payment start');

  // use the orders api to create an order
  async function createOrder() {
    let total = req.params.total;
    let totalUsd = total / 80;
    totalUsd = Math.round(totalUsd);

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalUsd,
            },
          },
        ],
      }),
    });

    const data = await response.json();
    return data;
  }

  const order = await createOrder();
  res.json(order);
  // res.redirect('/homepage');
  // req.order = order;

  // next();
};
exports.confirmOrder = async (req, res, next) => {
  const user = req.user;

  const found = user.Address.find((el) => el.isSelect === true);

  const quantities = [];

  const products = await Promise.all(
    user.cart.map(async (el) => {
      quantities.push(el.quantity);
      const product = await Product.findById(el.prodId);
      return product;
    })
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { orderId: req.body.orderData.id } },
    {
      new: true,
      runValidators: true,
    }
  );

  const newOrder = await Order.create({
    orderId: req.body.orderData.id,
    deliveryDetails: found,
    products: user.cart,
    paymentMethod: 'Online',
  });

  req.body.order = newOrder;
  req.body.user = user;
  req.products = products;
  req.quantities = quantities;

  next();
};

exports.approval = async (req, res) => {
  // use the orders api to capture payment for an order
  async function capturePayment(orderId) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data;
  }
  const { orderID } = req.params;
  const captureData = await capturePayment(orderID);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
};

exports.applyCoupon = async (req, res, next) => {
  let totalAmt = req.params.total;
  const coupon = await Coupon.findOne({ name: req.body.couponCode });
  if (totalAmt >= coupon.minValue && coupon.status) {
    const discount = (totalAmt * coupon.discount) / 100;
    if (discount < coupon.maxValue) {
      totalAmt = totalAmt - discount;
    } else {
      totalAmt = totalAmt - coupon.maxValue;
    }
  }
  await Coupon.findOneAndUpdate(
    { name: req.body.couponCode },
    { status: false }
  );
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { currentCoupon: coupon.name }
  );
  const obj = { grandTotal: totalAmt };
  res.json(obj);
};

exports.womensWear = async (req, res, next) => {
  const products = await Product.find({ category: "women's wear" });
  req.products = products;
  next();
};

exports.mensWear = async (req, res, next) => {
  const products = await Product.find({ category: "men's wear" });
  req.products = products;
  next();
};

exports.accessories = async (req, res, next) => {
  const products = await Product.find({
    category: ['men accessories', 'women accessories'],
  });
  req.products = products;
  next();
};
