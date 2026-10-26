/**
 * Global Error Handling Middleware
 * Must have four parameters (err, req, res, next) for Express to recognize it as an error handler.
 * Logs technical details to the terminal while safeguarding sensitive stack traces from API clients.
 */
function errorHandler(err, req, res, next) {
  // Log technical details and stack trace in the terminal for debugging
  console.error('[Internal Error Details]:', err);

  // 1. Handle malformed JSON body errors thrown by express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload. Please ensure the request body contains valid JSON.'
    });
  }

  // 2. Handle Mongoose Schema Validation Errors
  if (err.name === 'ValidationError') {
    const fieldErrors = {};
    if (err.errors) {
      for (const field in err.errors) {
        fieldErrors[field] = err.errors[field].message;
      }
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: fieldErrors
    });
  }

  // 3. Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field '${err.path || 'id'}'. Expected valid ${err.kind || 'ObjectId'}.`
    });
  }

  // 4. Handle pre-save hook or custom validation errors explicitly thrown
  if (err.message === 'Title cannot be empty or contain only whitespace') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: {
        title: err.message
      }
    });
  }

  // 5. General HTTP and server errors
  const statusCode = err.statusCode || err.status || 500;
  const clientMessage = statusCode === 500
    ? 'Internal Server Error'
    : (err.message || 'An unexpected error occurred.');

  return res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
}

module.exports = errorHandler;
