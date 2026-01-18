const path = require('path');
const fs = require('fs');

// SSR middleware - simplified version that doesn't require React on server side
const ssrMiddleware = async (req, res, next) => {
  try {
    // Only SSR for specific routes (products, homepage)
    const ssrRoutes = ['/', '/products'];
    const isSSRRoute = ssrRoutes.some(route => req.path === route || req.path.startsWith(route + '/'));
    
    if (!isSSRRoute) {
      return next();
    }

    // For now, just serve the static HTML without server-side rendering
    // This avoids the React module import issues
    const indexPath = path.join(__dirname, '../dist/index.html');
    
    if (fs.existsSync(indexPath)) {
      let template = fs.readFileSync(indexPath, 'utf8');
      
      // Add basic SEO meta tags dynamically
      const baseUrl = process.env.BASE_URL || 'https://divaskloset.com';
      
      if (req.path === '/') {
        template = template.replace(
          '<title>Divas Kloset - Premium Fashion for Modern Women</title>',
          '<title>Divas Kloset - Premium Fashion for Modern Women | Shop Now</title>'
        );
      } else if (req.path.startsWith('/products')) {
        template = template.replace(
          '<title>Divas Kloset - Premium Fashion for Modern Women</title>',
          '<title>Products - Divas Kloset | Premium Fashion Collection</title>'
        );
      }
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(template);
    }
    
    next();

  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side rendering
    next();
  }
};

module.exports = ssrMiddleware;
