const Database = require('./database');

async function testProducts() {
  try {
    await Database.init();
    const products = await Database.getAllProducts(10, 0);
    console.log('Total products:', products.length);
    products.forEach(p => console.log('- ' + p.name + ' (ID: ' + p.id + ')'));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProducts();
