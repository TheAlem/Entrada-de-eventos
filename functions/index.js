
const VerifyQr = require("./src/verifyQr");
const sendEmail = require("./src/sendEmail");
const paymentCallback = require("./src/paymentCallback");

exports.VerifyQr = VerifyQr;
exports.sendEmail = sendEmail.sendEmail;
exports.paymentCallback = paymentCallback.paymentCallback;
