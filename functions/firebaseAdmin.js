const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./transachain-firebase-adminsdk-ntms2-b17f45d016.json")),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
