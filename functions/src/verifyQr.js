const functions = require("firebase-functions");
const cors = require("cors");
const { admin } = require("../firebaseAdmin");

const corsHandler = cors({ origin: true, methods: ["POST"] });

const verifyQr = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send({ message: "Método no permitido" });
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token requerido" });
    }

    handleQrVerification(token)
        .then((result) => res.status(200).json(result))
        .catch((error) => res.status(error.status || 500).json({ message: error.message }));
  });
});

async function handleQrVerification(token) {
  const clientesCollection = admin.firestore().collection("clientes");
  const querySnapshot = await clientesCollection.where("token", "==", token).get();

  if (querySnapshot.empty) {
    const error = new Error("QR inválido");
    error.status = 404; // Código para "No encontrado"
    throw error;
  }

  const docRef = querySnapshot.docs[0].ref;
  const entry = querySnapshot.docs[0].data();

  if (entry.scanned) {
    const error = new Error("QR ya escaneado");
    error.status = 409; // Código para "Conflicto"
    throw error;
  }

  if (!entry.paymentStatus) {
    const error = new Error("Pago no completado");
    error.status = 402; // Código para "Pago requerido"
    throw error;
  }

  await docRef.update({ scanned: true });
  return {
    message: "Entrada validada, disfrute el evento",
    email: entry.email,
    name: entry.firstName + " " + entry.lastName,
    token: token,
  };
}

module.exports = verifyQr;
