module.exports = function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Erro interno do servidor.',
    details: error.details || null
  });
};
