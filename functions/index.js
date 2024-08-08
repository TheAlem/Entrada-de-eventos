
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const sendEmail = require("./src/sendEmail");
const verifyQr = require("./src/verifyQr");

exports.verifyQr = verifyQr.verifyQr;
exports.sendEmail = sendEmail.sendEmail;
