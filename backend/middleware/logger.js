/**
 * Request Logging Middleware
 * Records the HTTP method, request URL, and ISO timestamp for every incoming request.
 */
function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
  next();
}

module.exports = logger;
