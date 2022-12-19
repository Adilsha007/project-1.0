const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product must have a name '],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A product name must have less or equal than 40 characters',
      ],
      minlength: [
        5,
        'A product name must have more or equal than 10 characters',
      ],
    },
    category: {
      type: String,
      required: [true, 'Product must have a category'],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price'],
    },
    priceDiscount: Number,
    description: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary'],
    },
    imageCover: {
      type: String,
      // required : [true,'Trour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: String,
      default: new Date().toLocaleDateString(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document Middleware : runs before .save() and .create()
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
