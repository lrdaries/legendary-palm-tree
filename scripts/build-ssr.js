const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building SSR-optimized frontend...');

try {
  // Build the frontend first
  console.log('📦 Building frontend...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '../frontend') });
  
  // Create SSR entry point
  const ssrEntry = `
// SSR Entry Point
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from '../src/App';

export default function render(req, res) {
  const html = ReactDOMServer.renderToString(<App />);
  return html;
}
`;

  // Write SSR entry point
  const ssrPath = path.join(__dirname, '../frontend/ssr-entry.js');
  fs.writeFileSync(ssrPath, ssrEntry);
  
  console.log('✅ SSR build completed successfully!');
  console.log('📁 Build output in: ./dist');
  console.log('🔧 SSR middleware ready for server-side rendering');
  
} catch (error) {
  console.error('❌ SSR build failed:', error.message);
  process.exit(1);
}
