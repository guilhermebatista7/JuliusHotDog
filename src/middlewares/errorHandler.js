module.exports = function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  console.error('[Erro API]', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: error.message,
    details: error.details,
    stack: error.stack
  });

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Erro interno do servidor.',
    details: error.details || null
  });
};
