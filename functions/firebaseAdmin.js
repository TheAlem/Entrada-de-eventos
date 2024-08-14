const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./energiaboliviappandroid-firebase-adminsdk-9vht4-7eba2d155c.json")),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
