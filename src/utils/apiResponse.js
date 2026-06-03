function success(res, data, message = 'Operacao realizada com sucesso.', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

module.exports = { success };
