const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Database connection options
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
};

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL, dbOptions);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

// Disconnect from MongoDB
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB disconnected');
    } catch (error) {
        logger.error(`Error disconnecting from database: ${error.message}`);
        throw error;
    }
};

// Check connection status
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Get database stats
const getDBStats = async () => {
    try {
        const db = mongoose.connection.db;
        return await db.command({ dbStats: 1 });
    } catch (error) {
        logger.error(`Error getting database stats: ${error.message}`);
        throw error;
    }
};

// User related operations
const userOperations = {
    // Create a new user
    createUser: async (userData) => {
        try {
            const user = await User.create(userData);
            return { success: true, data: user };
        } catch (error) {
            logger.error(`Error creating user: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Find user by ID
    findUserById: async (id) => {
        try {
            const user = await User.findById(id).select('-password -__v');
            return { success: true, data: user };
        } catch (error) {
            logger.error(`Error finding user: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Find user by email
    findUserByEmail: async (email) => {
        try {
            const user = await User.findOne({ email }).select('+password');
            return { success: true, data: user };
        } catch (error) {
            logger.error(`Error finding user by email: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Update user
    updateUser: async (id, updateData) => {
        try {
            const user = await User.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            }).select('-password -__v');
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }
            
            return { success: true, data: user };
        } catch (error) {
            logger.error(`Error updating user: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Delete user
    deleteUser: async (id) => {
        try {
            const user = await User.findByIdAndDelete(id);
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }
            
            return { success: true, data: null };
        } catch (error) {
            logger.error(`Error deleting user: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
};

// Product related operations
const productOperations = {
    // Create a new product
    createProduct: async (productData) => {
        try {
            const product = await Product.create(productData);
            return { success: true, data: product };
        } catch (error) {
            logger.error(`Error creating product: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Get all products with filtering, sorting, and pagination
    getProducts: async (query = {}) => {
        try {
            // 1) Filtering
            const queryObj = { ...query };
            const excludedFields = ['page', 'sort', 'limit', 'fields'];
            excludedFields.forEach(el => delete queryObj[el]);
            
            // Advanced filtering
            let queryStr = JSON.stringify(queryObj);
            queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
            
            let dbQuery = Product.find(JSON.parse(queryStr));
            
            // 2) Sorting
            if (query.sort) {
                const sortBy = query.sort.split(',').join(' ');
                dbQuery = dbQuery.sort(sortBy);
            } else {
                dbQuery = dbQuery.sort('-createdAt');
            }
            
            // 3) Field limiting
            if (query.fields) {
                const fields = query.fields.split(',').join(' ');
                dbQuery = dbQuery.select(fields);
            } else {
                dbQuery = dbQuery.select('-__v');
            }
            
            // 4) Pagination
            const page = query.page * 1 || 1;
            const limit = query.limit * 1 || 10;
            const skip = (page - 1) * limit;
            
            dbQuery = dbQuery.skip(skip).limit(limit);
            
            // Execute query
            const products = await dbQuery;
            const total = await Product.countDocuments(JSON.parse(queryStr));
            
            return {
                success: true,
                results: products.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                data: products
            };
        } catch (error) {
            logger.error(`Error getting products: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Get product by ID
    getProductById: async (id) => {
        try {
            const product = await Product.findById(id);
            
            if (!product) {
                return { success: false, error: 'Product not found' };
            }
            
            return { success: true, data: product };
        } catch (error) {
            logger.error(`Error getting product: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Update product
    updateProduct: async (id, updateData) => {
        try {
            const product = await Product.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            });
            
            if (!product) {
                return { success: false, error: 'Product not found' };
            }
            
            return { success: true, data: product };
        } catch (error) {
            logger.error(`Error updating product: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Delete product
    deleteProduct: async (id) => {
        try {
            const product = await Product.findByIdAndDelete(id);
            
            if (!product) {
                return { success: false, error: 'Product not found' };
            }
            
            return { success: true, data: null };
        } catch (error) {
            logger.error(`Error deleting product: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Get product statistics by category
    getProductStats: async () => {
        try {
            const stats = await Product.aggregate([
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
            
            return { success: true, data: stats };
        } catch (error) {
            logger.error(`Error getting product stats: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
};

// Order related operations
const orderOperations = {
    // Create a new order
    createOrder: async (orderData) => {
        try {
            const order = await Order.create(orderData);
            
            // Update product quantities
            await order.updateProductStock();
            
            return { success: true, data: order };
        } catch (error) {
            logger.error(`Error creating order: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Get all orders with filtering and pagination
    getOrders: async (query = {}) => {
        try {
            const page = query.page * 1 || 1;
            const limit = query.limit * 1 || 10;
            const skip = (page - 1) * limit;
            
            // Build query
            let filter = {};
            if (query.userId) filter.user = query.userId;
            if (query.status) filter.status = query.status;
            
            const orders = await Order.find(filter)
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .populate('user', 'firstName lastName email')
                .populate('items.product', 'name price image');
                
            const total = await Order.countDocuments(filter);
            
            return {
                success: true,
                results: orders.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                data: orders
            };
        } catch (error) {
            logger.error(`Error getting orders: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Get order by ID
    getOrderById: async (id) => {
        try {
            const order = await Order.findById(id)
                .populate('user', 'firstName lastName email')
                .populate('items.product', 'name price image slug');
                
            if (!order) {
                return { success: false, error: 'Order not found' };
            }
            
            return { success: true, data: order };
        } catch (error) {
            logger.error(`Error getting order: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Update order status
    updateOrderStatus: async (id, status, userId) => {
        try {
            const order = await Order.findById(id);
            
            if (!order) {
                return { success: false, error: 'Order not found' };
            }
            
            // Update status
            order.status = status;
            
            // Update timestamps based on status
            if (status === 'delivered' && !order.deliveredAt) {
                order.deliveredAt = Date.now();
            } else if (status === 'cancelled') {
                // If order is cancelled, return stock to inventory
                await order.returnStockToInventory();
            }
            
            // Add status history
            order.statusHistory.push({
                status,
                changedBy: userId,
                changedAt: Date.now()
            });
            
            await order.save();
            
            return { success: true, data: order };
        } catch (error) {
            logger.error(`Error updating order status: ${error.message}`);
            return { success: false, error: error.message };
        }
    },
    
    // Get sales statistics
    getSalesStats: async (startDate, endDate) => {
        try {
            const stats = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        },
                        status: { $ne: 'cancelled' }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        numOrders: { $sum: 1 },
                        totalSales: { $sum: '$totalPrice' },
                        avgOrderValue: { $avg: '$totalPrice' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            
            return { success: true, data: stats };
        } catch (error) {
            logger.error(`Error getting sales stats: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from DB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (error) {
        logger.error(`Error closing MongoDB connection: ${error.message}`);
        process.exit(1);
    }
});

// Close the connection when the Node process ends
process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
});

module.exports = {
    // Connection methods
    connectDB,
    disconnectDB,
    isConnected,
    getDBStats,
    
    // Models
    User,
    Product,
    Order,
    
    // Operations
    user: userOperations,
    product: productOperations,
    order: orderOperations
};
