const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.verifyQr = functions.https.onRequest(async (req, res) => {
  try {
    const { token } = req.body;
    const q = admin.firestore().collection("clientes").where("token", "==", token);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return res.status(400).json({ valid: false, message: "QR inválido" });
    }

    const doc = querySnapshot.docs[0];
    const entry = doc.data();

    if (entry.scanned) {
      return res.status(400).json({ valid: false, message: "QR ya escaneado" });
    }

    await doc.ref.update({ scanned: true });

    return res.status(200).json({ valid: true, message: "QR válido" });
  } catch (error) {
    console.error("Error verificando QR:", error);
    return res.status(500).json({ valid: false, message: "Error verificando QR" });
  }
});
