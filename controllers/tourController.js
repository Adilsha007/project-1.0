// const fs = require('fs');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// const tours = JSON.parse (fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkId = (req,res,next,val)=>{
//     console.log(`your Id is ${val}`);
//     if(val > tours.length){
//         return res.status(404).json({
//             Status : 'fail',
//             message : 'Invalid Id'
//         })
//     }
//     next();
// }

// exports.checkBody = (req,res,next)=>{

//     if(!req.body.name || !req.body.price ){
//         return res.status(400).json({
//             Status : 'fail',
//             message : 'Tour details must have both name and price'
//         })
//     }

//     next();

// }

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    console.log('filtering');
    // 1a, filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(this.query,queryObj);

    // 1b, Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr))

    return this;
  }

  sort() {
    console.log('sorting');
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    console.log('limiting');
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    console.log('paginating');
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    console.log(page, limit, skip);

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

exports.getAllproducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  req.body.products = await features.query;

  // res.status(200).
  // json({
  //   Status: 'success',
  //   result: tours.length,
  //   data: {
  //     tours,
  //   },
  // });

  //     try {
  //         // Build query
  //         // // 1a, filtering
  //         // const queryObj = {...req.query}
  //         // const excludedFields = ['page','sort','limit','fields']

  //         // excludedFields.forEach(el => delete queryObj[el])
  //         // console.log(req.query,queryObj);

  //         // // 1b, Advance filtering
  //         // let queryStr = JSON.stringify(queryObj)
  //         // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match=> `$${match}`)
  //         // console.log(JSON.parse(queryStr));

  //         // let query = Tour.find(JSON.parse(queryStr))

  //         // 2, sorting
  //         // if(req.query.sort){
  //         //     const sortBy = req.query.sort.split(',').join(' ')
  //         //     console.log(sortBy);
  //         //     query = query.sort(sortBy)
  //         // }else {
  //         //     query = query.sort('-createdAt')
  //         // }

  //         //3, field limiting
  //         // if(req.query.fields){
  //         //     const fields = req.query.fields.split(',').join(' ')
  //         //     query = query.select(fields)
  //         // }else{
  //         //     query = query.select('-__v')
  //         // }

  //         //4, pagination
  //         // const page = req.query.page * 1 || 1 ;
  //         // const limit = req.query.limit * 1 || 100;
  //         // const skip = (page - 1) * limit ;
  //         // console.log(page,limit,skip);

  //         // query = query.skip(skip).limit(limit)

  //         // if(req.query.page){
  //         //     const numTours = await Tour.countDocuments();
  //         //     if(skip >= numTours) throw new Error('This page does not exist')
  //         // }

  //         // Execute query

  //     } catch (error) {
  //         res.status(400).json({
  //             Status : 'fail',
  //             message : error
  //         })
  //     }
  next();
});

exports.getProduct = catchAsync(async (req, res, next) => {
  // console.log(req.params.id);
  const product = await Product.findById(req.params.id);
  // console.log(product);
  req.body.product = product;
  if (!product) {
    return next(new AppError('No tour found with this id'), 404);
  }

  next();
  // const id = req.params.id * 1
  // const tour = tours.find(el => el.id === id)

  // res.status(200).redirect(`/editProduct/${id}`)
  // json({
  //   Status: 'success',
  //   data: {
  //     tour,
  //   },
  // });

  // try {

  // } catch (error) {
  //     res.status(400).json({
  //         Status : 'fail',
  //         message : error
  //     })
  // }
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No tour found with this id'), 404);
  }

  req.body.product = product;

  res.status(200).redirect('/admin/viewProduct');
  // json({
  //   Status: 'success',
  //   data: {
  //     tour,
  //   },
  // });

  // try {

  // } catch (error) {
  //     res.status(400).json({
  //         Status : 'fail',
  //         message : error
  //     })
  // }
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No tour found with this id'), 404);
  }

  res.status(200).redirect('/viewProduct');
  // json({
  //   Status: 'success',
  //   data: {
  //     tour,
  //   },
  // });

  // try {

  // } catch (error) {
  //     res.status(400).json({
  //         Status : 'fail',
  //         message : error
  //     })
  // }
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);

  let image = req.files.image;

  image.mv(
    `./public/images/product/ludus/${newProduct._id}.jpeg`,
    (err, done) => {
      if (!err) {
        res.status(201).redirect('/admin/viewProduct');
      }
    }
  );

  // send({
  //   Status: 'success',
  //   data: {
  //     newProduct,
  //   },
  // });

  // try {

  // } catch (error) {
  //     res.status(400).json({
  //         Status : 'fail',
  //         message : error.message
  //     })
  // }

  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({id : newId}, req.body)

  // tours.push(newTour)

  // fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,JSON.stringify(tours),(err)=>{
  //     res.status(201).send('a new tour has been added')
  // })
});

exports.addToCart = async (req, res, next) => {
  const id = req.params.id;
  const users = await User.findOne({ _id: req.user._id });

  function prodExists(prodId) {
    return users.cart.some(function (el) {
      return el.prodId === prodId;
    });
  }

  if (prodExists(id)) {
    const found = users.cart.find((el) => el.prodId === id);
    let quantity = found.quantity + 1;
    await User.updateOne(
      { _id: req.user.id, 'cart.prodId': id },
      { $set: { 'cart.$.quantity': quantity } }
    );
  } else {
    const prodObj = {
      prodId: id,
      quantity: 1,
    };
    const updatedUser = await User.findByIdAndUpdate(
      users._id,
      { $push: { cart: prodObj } },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  res.redirect('/homepage');
};

exports.addTowishList = async (req, res, next) => {
  console.log('wishlist route is runnigng    ' + req.params.id);

  const id = req.params.id;
  const users = await User.findOne({ _id: req.user._id });

  const found = users.wishlist.find((el) => el.prodId === id);

  if (!found) {
    const product = await Product.findById(id);
    const updatedUser = await User.findByIdAndUpdate(
      users._id,
      { $push: { wishlist: product._id } },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  // res.redirect('/homepage');
};

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(201).send({
    Status: 'success',
    data: {
      stats,
    },
  });

  // try {

  // } catch (error) {
  //     res.status(400).json({
  //         Status : 'fail',
  //         message : error
  //     })
  // }
});

exports.getMonthlyPlan = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({
      Status: 'fail',
      message: error,
    });
  }
};
