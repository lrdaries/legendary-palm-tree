const mongoose = require('mongoose');
const slugify = require('slugify');
const { getCategoryKeys, isValidCategory, isValidSubcategory } = require('../config/categories');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      trim: true,
      maxlength: [100, 'A product name must have less or equal than 100 characters'],
      minlength: [5, 'A product name must have more or equal than 5 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'A product must have a description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      min: [0, 'Price must be above 0']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    category: {
      type: String,
      required: [true, 'A product must belong to a category'],
      enum: {
        values: getCategoryKeys(),
        message: 'Category must be one of the predefined categories'
      },
      validate: {
        validator: function(val) {
          return isValidCategory(val);
        },
        message: 'Invalid category selected'
      }
    },
    subcategory: {
      type: String,
      validate: {
        validator: function(val) {
          // If subcategory is provided, validate it belongs to the category
          if (val && this.category) {
            return isValidSubcategory(this.category, val);
          }
          // Subcategory is optional
          return true;
        },
        message: 'Subcategory must belong to the selected category'
      }
    },
    brand: {
      type: String,
      required: [true, 'A product must have a brand']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    images: [String],
    coverImage: {
      type: String,
      required: [true, 'A product must have a cover image']
    },
    colors: [String],
    sizes: [
      {
        size: {
          type: String,
          required: [true, 'Please provide size'],
          enum: {
            values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'],
            message: 'Size is either: XS, S, M, L, XL, XXL, XXXL, One Size'
          }
        },
        quantity: {
          type: Number,
          required: [true, 'Please provide quantity for this size'],
          min: [0, 'Quantity cannot be negative']
        }
      }
    ],
    inStock: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    isNewArrival: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    isOnSale: {
      type: Boolean,
      default: false
    },
    tags: [String],
    specifications: [
      {
        key: String,
        value: String
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create product slug from the name
productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Virtual populate reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

// Indexes for better query performance
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Document middleware to update inStock based on sizes quantity
productSchema.pre('save', function(next) {
  const hasStock = this.sizes.some(size => size.quantity > 0);
  this.inStock = hasStock;
  next();
});

// Query middleware to find only in-stock products
productSchema.pre(/^find/, function(next) {
  this.find({ inStock: { $ne: false } });
  next();
});

// Static method to get product stats by category
productSchema.statics.getProductStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$category',
        numProducts: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalQuantity: {
          $sum: {
            $sum: '$sizes.quantity'
          }
        }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
