const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/mail');
const userHelper = require('../helpers/userHelper');

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNo: req.body.phoneNo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    isVerify: req.body.isVerify,
  });

  userHelper.createSendToken(newUser, 201, res);
  userHelper.otpValidation(req, res, next);

  res.render('../views/users/otp.ejs', {
    layout: '../views/layouts/layout.ejs',
    newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.correctPassword(password, user.password))) {
    const error = next(new AppError('Incorrect email or password!', 401));
    console.log(error);
    return res.redirect('/login');
  }

  if (!user.isverify) {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { isVerify: 'true' },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  userHelper.createSendToken(user, 200, res);

  if (user.role == 'admin') {
    console.log('redirected to admin');
    return res.redirect('/admin');
  }

  res.redirect('/homepage');
});

exports.logout = (req, res) => {
  res
    .cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 1 * 1000),
      httpOnly: true,
    })
    .redirect('/guesthome');
};

exports.protec = catchAsync(async (req, res, next) => {
  // 1, Getting token and check of it's there
  let token = req.cookies.jwt;

  if (!token) {
    console.log('testin token');
    return res.redirect('/login');
  }

  // 2, Token verification

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3, check user if still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user no longer exists', 401));
  }

  // 4, check if user changed password after the token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    console.log('change password');
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1, get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email Id', 404));
  }

  // 2, Generate the random reset token
  const resetToken = user.createPasswordRestToken();
  await user.save({ validateBeforeSave: false });

  // 3, send to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/resetPassword/${resetToken}`;

  const message = `Forgot your Email? Please send a PATCH request with your new password to : ${resetURL}./n If you didn't, Please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token is only valid for 10 minutes',
      message,
    });

    res.status(200).render('../views/users/resetMail.ejs', {
      layout: '../views/layouts/layout.ejs',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email. Please try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1, get user based on token
  const user = await User.findOne({
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(`user : ${user}`);
  // 2, If token hasn't expired and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  console.log(req.body);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3, update changedPasswordAt property for the user

  // 4, Log the user in and send JWT
  res.redirect('/login');
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log('entering update password route');
  console.log(req.user);
  // 1, get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2, check if posted current password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3, if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4, Log user in and send JWT
  res.redirect('/login');
});
