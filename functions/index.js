
const VerifyQr = require("./src/verifyQr");
const sendEmail = require("./src/sendEmail");
const receiveNotification = require("./src/ReceiveNotification");
const generateQrProxy = require("./src/generateQrProxy");
const authProxy = require("./src/authProxy");

exports.VerifyQr = VerifyQr;
exports.sendEmail = sendEmail.sendEmail;
exports.receiveNotification = receiveNotification.receiveNotification;

// Exportar las funciones del proxy
exports.authProxy = authProxy.authProxy;
exports.generateQrProxy = generateQrProxy.generateQrProxy;
