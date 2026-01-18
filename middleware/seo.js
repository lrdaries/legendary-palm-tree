const addStructuredData = (req, res, next) => {
  const baseUrl = process.env.BASE_URL || 'https://divaskloset.com';
  
  // Organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Divas Kloset",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon-32x32.png`,
    "description": "Premium fashion designed for the modern woman. Sophisticated, minimalist, and uncompromising in quality.",
    "sameAs": [
      // Add social media URLs when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  // Website structured data
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Divas Kloset",
    "url": baseUrl,
    "description": "Shop premium fashion designed for the modern woman. Sophisticated, minimalist, and uncompromising in quality.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/products?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Store structured data in res.locals for use in templates
  res.locals.structuredData = [organizationData, websiteData];
  
  next();
};

module.exports = { addStructuredData };
