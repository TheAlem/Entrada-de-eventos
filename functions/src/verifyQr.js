const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.verifyQr = functions.https.onRequest(async (req, res) => {
  console.log("Datos recibidos en el cuerpo de la solicitud:", req.body);

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Manejar solicitudes de preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: 1, status: 0, message: "Método no permitido" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      error: 1,
      status: 0,
      message: "Faltan datos necesarios",
      missing: { token: !token },
    });
  }

  try {
    const clientesCollection = admin.firestore().collection("clientes");
    const querySnapshot = await clientesCollection.where("token", "==", token).get();

    if (querySnapshot.empty) {
      console.log("No se encontró ningún cliente con el token:", token);
      return res.status(404).json({ error: 1, status: 0, message: "QR inválido" });
    }

    const docRef = querySnapshot.docs[0].ref;
    const entry = querySnapshot.docs[0].data();

    if (entry.scanned) {
      return res.status(409).json({ error: 1, status: 0, message: "QR ya escaneado" });
    }

    if (!entry.paymentStatus || entry.paymentStatus !== "completed") {
      return res.status(403).json({
        error: 1,
        status: 0,
        message: "Entrada no válida, pago no completado",
      });
    }

    await docRef.update({ scanned: true });
    return res.status(200).json({
      error: 0,
      status: 1,
      message: "Entrada validada, disfrute el evento",
    });
  } catch (error) {
    console.error(`Error al procesar el QR: ${error}`);
    return res.status(500).json({ error: 1, status: 0, message: "Error interno del servidor" });
  }
});
