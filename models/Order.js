const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Order item must belong to a product']
  },
  name: {
    type: String,
    required: [true, 'Order item must have a name']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Order item must have a price']
  },
  size: {
    type: String,
    required: [true, 'Please provide size']
  },
  color: {
    type: String,
    required: [true, 'Please provide color']
  },
  image: String,
  slug: String
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user']
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, 'Please provide full name']
      },
      address: {
        type: String,
        required: [true, 'Please provide address']
      },
      city: {
        type: String,
        required: [true, 'Please provide city']
      },
      state: {
        type: String,
        required: [true, 'Please provide state']
      },
      postalCode: {
        type: String,
        required: [true, 'Please provide postal code']
      },
      country: {
        type: String,
        required: [true, 'Please provide country']
      },
      phone: String
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please provide payment method'],
      enum: {
        values: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
        message: 'Payment method is either: credit_card, paypal, bank_transfer, cash_on_delivery'
      }
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    trackingNumber: String,
    shippingCarrier: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ 'shippingAddress.email': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

// Document middleware to calculate prices before saving
orderSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    // Calculate items price
    this.itemsPrice = this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calculate shipping price (example: free shipping for orders over $100)
    this.shippingPrice = this.itemsPrice > 100 ? 0 : 10;

    // Calculate tax (example: 10% tax)
    this.taxPrice = Number((this.itemsPrice * 0.1).toFixed(2));

    // Calculate total price
    this.totalPrice = this.itemsPrice + this.shippingPrice + this.taxPrice;
  }
  next();
});

// Query middleware to populate user and product data
orderSchema.pre(/^find/, function(next) {
  this.populate('user', 'firstName lastName email');
  next();
});

// Instance method to update product stock after order is placed
orderSchema.methods.updateProductStock = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    await Product.updateOne(
      { 
        _id: item.product,
        'sizes.size': item.size
      },
      { 
        $inc: { 'sizes.$.quantity': -item.quantity },
        $set: { inStock: true } // Will be updated by pre-save hook
      }
    );
  }
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
