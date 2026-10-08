export function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred while processing your request. Please try again or contact us directly.'
    : err.message || 'Server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
