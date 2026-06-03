module.exports = function asyncHandler(handler) {
  return async function asyncWrappedHandler(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
