#!/bin/bash

echo "🔧 Building React Admin Dashboard..."

# Navigate to admin directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the React app
echo "🏗 Building admin dashboard..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin dashboard built successfully!"
    echo "📁 Build output: admin/dist/"
    echo "🌐 Admin will be available at: http://localhost:3000/admin"
    echo ""
    echo "To start the server, run: npm start"
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above."
fi

echo ""
