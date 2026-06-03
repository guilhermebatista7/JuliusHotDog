module.exports = function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Rota nao encontrada: ${req.method} ${req.originalUrl}`
  });
};
