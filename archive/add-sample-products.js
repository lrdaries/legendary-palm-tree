const Database = require('./database');

const sampleProducts = [
  {
    name: 'Elegant Evening Gown',
    description: 'Stunning evening gown perfect for special occasions. Made with premium fabric and exquisite detailing.',
    price: 299.99,
    category: 'dresses',
    image_url: 'https://images.unsplash.com/photo-1594634312681-425c7b97ccd1?q=80&w=800',
    in_stock: true,
    sku: 'EVG001'
  },
  {
    name: 'Classic Business Suit',
    description: 'Professional business suit tailored for modern executive. Sharp, comfortable, and stylish.',
    price: 449.99,
    category: 'suits',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800',
    in_stock: true,
    sku: 'CBS002'
  },
  {
    name: 'Casual Summer Dress',
    description: 'Light and breezy summer dress perfect for beach days and casual outings.',
    price: 89.99,
    category: 'dresses',
    image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800',
    in_stock: true,
    sku: 'CSD003'
  },
  {
    name: 'Designer Handbag',
    description: 'Luxury handbag crafted with genuine leather and premium hardware.',
    price: 199.99,
    category: 'accessories',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800',
    in_stock: true,
    sku: 'DHB004'
  }
];

async function addSampleProducts() {
  try {
    await Database.init();
    console.log('Adding sample products...');
    
    for (const product of sampleProducts) {
      await Database.createProduct(product);
      console.log('✅ Added:', product.name);
    }
    
    console.log('🎉 All sample products added successfully!');
  } catch (error) {
    console.error('❌ Error adding products:', error.message);
  }
}

addSampleProducts();
