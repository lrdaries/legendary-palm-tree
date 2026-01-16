// Minimal test serverless function
module.exports = (req, res) => {
  res.json({
    message: 'Serverless function working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
};
