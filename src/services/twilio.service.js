// File: verifyWithApiKey.js

const config = require('../config/config.js');
const twilio = require('twilio');
const logger = require('../config/logger');
const { sanitizeForLog } = logger;


// Load environment variables
const apiKeySid = config.twilio.apiKeySid;
const apiKeySecret = config.twilio.apiKeySecret;
const accountSid = config.twilio.accountSid;
const verifyServiceSid = config.twilio.verifyServiceSid;

// Initialize Twilio client using API Key + Account SID
const client = twilio(apiKeySid, apiKeySecret, { accountSid });

// Your Verify Service SID (starts with VA…)

/**
 * Send an OTP via the Verify Service.
 * @param {string} phoneNumber - E.164 format (e.g., "+1234567890")
 * @param {'sms'|'call'|'email'|'whatsapp'} channel - Delivery channel
 */
const sendOTP = async (phoneNumber) => {
  logger.logServiceStart('TwilioService', 'sendOTP', { phoneNumber });

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });

    logger.info('[SERVICE] TwilioService.sendOTP - OTP sent successfully', {
      phoneNumber: sanitizeForLog(phoneNumber),
      status: verification.status,
      sid: verification.sid
    });

    logger.logServiceEnd('TwilioService', 'sendOTP', { success: true, status: verification.status });
    return { success: true, status: verification.status };
  } catch (err) {
    logger.error('[SERVICE] TwilioService.sendOTP - Error sending OTP', {
      phoneNumber: sanitizeForLog(phoneNumber),
      error: sanitizeForLog(err.message),
      code: sanitizeForLog(err.code)
    });

    logger.logServiceEnd('TwilioService', 'sendOTP', { success: false });
    return { success: false, error: err.message };
  }
}

/**
 * Verify a received OTP code.
 * @param {string} phoneNumber - E.164 format
 * @param {string} code - The 6-digit code received by the user
 */
const verifyOTP = async (phoneNumber, code) => {
  logger.logServiceStart('TwilioService', 'verifyOTP', { phoneNumber, hasCode: !!code });

  try {
    const check = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks
      .create({ to: phoneNumber, code });

    logger.info('[SERVICE] TwilioService.verifyOTP - OTP verification completed', {
      phoneNumber: sanitizeForLog(phoneNumber),
      status: check.status,
      valid: check.valid,
      sid: check.sid
    });

    logger.logServiceEnd('TwilioService', 'verifyOTP', { success: check.valid, status: check.status });
    return { success: check.valid, status: check.status };
  } catch (err) {
    logger.error('[SERVICE] TwilioService.verifyOTP - Error verifying OTP', {
      phoneNumber: sanitizeForLog(phoneNumber),
      error: sanitizeForLog(err.message),
      code: sanitizeForLog(err.code)
    });

    logger.logServiceEnd('TwilioService', 'verifyOTP', { success: false });
    return { success: false, error: err.message };
  }
}


module.exports = {
  sendOTP,
  verifyOTP
}
