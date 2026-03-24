const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const logger = require('../config/logger');
const { userService, mediaService } = require('../services');
const { sanitizeForLog } = require('../utils/security');

const getProfile = catchAsync(async (req, res) => {
  logger.logControllerStart('ProfileController', 'getProfile', { userId: sanitizeForLog(req.user._id) });
  const user = req.user;
  logger.logControllerEnd('ProfileController', 'getProfile', { userId: sanitizeForLog(user._id) });
  const getProfile = await userService.getUserProfile(user._id);
  res.status(httpStatus.OK).send(getProfile);
});

const updateProfile = catchAsync(async (req, res) => {
  logger.logControllerStart('UserController', 'updateProfile', { userId: sanitizeForLog(req.user._id) });
  console.log(req?.body, "request body in controller");
  await userService.verifyDetail(req?.body);
  const updatedProfile = await userService.updateUserProfile(req.user._id, req.body);
  logger.logControllerEnd('UserController', 'updateProfile', { userId: sanitizeForLog(req.user._id) });
  res.status(httpStatus.OK).send({ user: updatedProfile });
});


const uploadmedia = catchAsync(async (req, res) => {
  logger.logControllerStart('MediaController', 'uploadmedia', {});
  if (!req.file) {
    logger.logControllerEnd('MediaController', 'uploadmedia', { error: 'No file uploaded' });
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const file = req.file;
  const result = await mediaService.uploadMediaService(res, file);
  logger.logControllerEnd('MediaController', 'uploadmedia', {});
  res.status(httpStatus.OK).send(result);
});

const updateProfileImageUrl = catchAsync(async (req, res) => {
  logger.logControllerStart('UserController', 'updateProfileImageUrl', { userId: sanitizeForLog(req.user._id) });
  const updatedProfile = await userService.updateProfileImageUrl(req.user._id, req.body);
  logger.logControllerEnd('UserController', 'updateProfileImageUrl', { userId: sanitizeForLog(req.user._id) });
  res.status(httpStatus.OK).send({ user: updatedProfile });
});

const gettest = catchAsync(async (req, res) => {
  console.log("test");
  res.status(httpStatus.OK).send("hello");
});

const createUserDateDays = catchAsync(async (req, res) => {
  const data = await userService.createUserDateDaysService({
    user_id: req.user._id,
    dates_days: req.body.dates_days,
  });

  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Date days saved successfully',
    data,
  });
});


const getUserDateDays = async (req, res) => {
  try {
    const user_id = req.user.id;

    const record = await userService.getUserDateDaysService(user_id);

    if (!record) {
      return res.status(404).json({
        status: false,
        message: 'User date days not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'User date days fetched successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};




module.exports = {
  getProfile,
  updateProfile,
  uploadmedia,
  updateProfileImageUrl,
  gettest,
  createUserDateDays,
  getUserDateDays
};
