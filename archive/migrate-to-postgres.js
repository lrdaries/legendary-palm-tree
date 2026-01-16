const sqliteDb = require('./database-sqlite');
const postgresDb = require('./database-postgres');

async function migrateData() {
    console.log('Starting migration from SQLite to PostgreSQL...');
    
    try {
        // Initialize both databases
        await sqliteDb.init();
        await postgresDb.init();
        
        // Migrate Users
        console.log('Migrating users...');
        const users = await sqliteDb.getAllUsers();
        for (const user of users) {
            try {
                await postgresDb.createUser({
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    password_hash: user.password_hash,
                    role: user.role,
                    verified: user.verified
                });
                console.log(`Migrated user: ${user.email}`);
            } catch (error) {
                if (error.message.includes('duplicate key')) {
                    console.log(`User ${user.email} already exists, skipping...`);
                } else {
                    console.error(`Error migrating user ${user.email}:`, error.message);
                }
            }
        }
        
        // Migrate Products
        console.log('Migrating products...');
        const products = await sqliteDb.getAllProducts(1000, 0); // Get all products
        for (const product of products) {
            try {
                await postgresDb.createProduct({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category,
                    image_url: product.image_url,
                    in_stock: product.in_stock,
                    sku: product.sku
                });
                console.log(`Migrated product: ${product.name}`);
            } catch (error) {
                console.error(`Error migrating product ${product.name}:`, error.message);
            }
        }
        
        // Migrate Orders
        console.log('Migrating orders...');
        const orders = await sqliteDb.getAllOrders(1000, 0); // Get all orders
        for (const order of orders) {
            try {
                await postgresDb.createOrder({
                    order_number: order.order_number,
                    customer_email: order.customer_email,
                    customer_name: order.customer_name,
                    total: order.total,
                    status: order.status
                });
                console.log(`Migrated order: ${order.order_number}`);
            } catch (error) {
                console.error(`Error migrating order ${order.order_number}:`, error.message);
            }
        }
        
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close connections
        if (sqliteDb.close) {
            await sqliteDb.close();
        }
        if (postgresDb.close) {
            await postgresDb.close();
        }
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateData();
}

module.exports = { migrateData };
