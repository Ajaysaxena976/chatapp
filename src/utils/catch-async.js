// Deprecated: Use asyncHandler instead
const asyncHandler = require('../middlewares/async-handler');

const catchAsync = (fn) => asyncHandler(fn);

module.exports = catchAsync;
