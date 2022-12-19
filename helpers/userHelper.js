const fast2sms = require('fast-two-sms');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
};

var randomOTP = Math.floor(Math.random() * 10000);

exports.otpValidation = (req, res, next) => {
  req.body.otp = randomOTP;
  console.log('seting up otp');
  const options = {
    authorization:
      'jGMpbHuHOq35AFV26oha2gX3IoLfW2WaS8urwhDQkr1ihpkhKOsMrwAYDzES',
    message: `This is a test OTP code message, Your OTP code is ${randomOTP}`,
    numbers: [req.body.phoneNo],
  };

  fast2sms
    .sendMessage(options)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.otpVerification = (req, res, next) => {
  const otp = req.body.otp * 1;

  try {
    if (otp === randomOTP) {
      console.log('otp verified');
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
  }
};
