const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.receiveNotification = functions.https.onRequest(async (req, res) => {
  // Asegurarse de que la solicitud es POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { QRId, Gloss, sourceBankId, originName, VoucherId, TransactionDateTime, additionalData } = req.body;

    // Validar que todos los campos necesarios están presentes
    if (!QRId || !Gloss || !sourceBankId || !originName || !VoucherId || !TransactionDateTime) {
      return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
    }

    // Preparar la data para guardar en Firestore
    const paymentData = {
      QRId,
      Gloss,
      sourceBankId,
      originName,
      VoucherId,
      TransactionDateTime,
      additionalData: additionalData || "",
      status: "paid", // Indica que este QR ha sido pagado
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Guardar la información del pago en Firestore
    const db = admin.firestore();
    const paymentRef = db.collection("payments").doc(QRId);

    // Evitar duplicados verificando si el documento ya existe
    const docSnapshot = await paymentRef.get();
    if (docSnapshot.exists) {
      return res.status(200).json({ success: true, message: "Notificación ya procesada" });
    }

    // Guardar la nueva notificación
    await paymentRef.set(paymentData);

    // Actualizar el estado de pago del cliente en la colección `clientes`
    const clientRef = db.collection("clientes").doc(QRId);
    await clientRef.update({ paymentStatus: true });

    // Responder con éxito
    return res.status(200).json({ success: true, message: "Notificación recibida y procesada con éxito" });
  } catch (error) {
    console.error("Error al procesar la notificación:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});
