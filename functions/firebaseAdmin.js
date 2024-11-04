const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./transachain-firebase-adminsdk-e64wu-2ec6e3c0f8.json")),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
