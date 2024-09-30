const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./transachain-firebase-adminsdk-m3b7q-7cdfe6cbd7.json")),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
