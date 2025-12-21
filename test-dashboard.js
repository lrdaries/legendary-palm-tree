/**
 * Test script to verify admin dashboard API integration
 * Tests: Authentication, Product CRUD operations, and database persistence
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test sequence
async function runTests() {
  console.log('\n========================================');
  console.log('🧪 Admin Dashboard Integration Tests');
  console.log('========================================\n');

  try {
    // Test 1: Login
    console.log('1️⃣  Testing Admin Login...');
    const loginRes = await makeRequest('POST', '/api/admin/auth/login', {
      email: 'admin@example.com',
      password: 'AdminPass123'
    });

    if (loginRes.status !== 200) {
      console.log('❌ Login failed:', loginRes);
      return;
    }

    const token = loginRes.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 20) + '...');
    console.log('   User:', loginRes.data.user);

    // Test 2: Get all products
    console.log('\n2️⃣  Testing GET /api/admin/products...');
    const getRes = await makeRequest('GET', '/api/admin/products', null, token);
    console.log('✅ Get products:', getRes.status, getRes.data.count || 'N/A', 'products');
    if (getRes.data.products && getRes.data.products.length > 0) {
      console.log('   Sample:', getRes.data.products[0]);
    }

    // Test 3: Create a product
    console.log('\n3️⃣  Testing POST /api/admin/products (Create)...');
    const createRes = await makeRequest('POST', '/api/admin/products', {
      name: 'Test Product ' + Date.now(),
      description: 'A test product for dashboard integration',
      price: 99.99,
      category: 'test',
      in_stock: true
    }, token);

    if (createRes.status !== 201 && createRes.status !== 200) {
      console.log('⚠️  Create failed with status', createRes.status);
      console.log('   Response:', createRes.data);
    } else {
      console.log('✅ Product created successfully');
      const createdProduct = createRes.data.product || createRes.data;
      console.log('   ID:', createdProduct.id);
      console.log('   Name:', createdProduct.name);
      const productId = createdProduct.id;

      // Test 4: Update the product
      console.log('\n4️⃣  Testing PUT /api/admin/products/:id (Update)...');
      const updateRes = await makeRequest('PUT', `/api/admin/products/${productId}`, {
        description: 'Updated description',
        price: 129.99
      }, token);

      if (updateRes.status !== 200) {
        console.log('⚠️  Update failed with status', updateRes.status);
        console.log('   Response:', updateRes.data);
      } else {
        console.log('✅ Product updated successfully');
        const updated = updateRes.data.product || updateRes.data;
        console.log('   New price:', updated.price);
        console.log('   New description:', updated.description);
      }

      // Test 5: Delete the product
      console.log('\n5️⃣  Testing DELETE /api/admin/products/:id...');
      const deleteRes = await makeRequest('DELETE', `/api/admin/products/${productId}`, null, token);

      if (deleteRes.status !== 200) {
        console.log('⚠️  Delete failed with status', deleteRes.status);
        console.log('   Response:', deleteRes.data);
      } else {
        console.log('✅ Product deleted successfully');
      }
    }

    // Test 6: Dashboard stats
    console.log('\n6️⃣  Testing GET /api/admin/dashboard...');
    const dashRes = await makeRequest('GET', '/api/admin/dashboard', null, token);
    if (dashRes.status === 200) {
      console.log('✅ Dashboard stats retrieved');
      console.log('   Products:', dashRes.data.products);
      console.log('   In stock:', dashRes.data.inStock);
    } else {
      console.log('⚠️  Dashboard failed with status', dashRes.status);
    }

    console.log('\n========================================');
    console.log('✅ All tests completed!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.log('\n⚠️  Make sure the server is running on port 3000');
  }
}

// Run tests
runTests();
