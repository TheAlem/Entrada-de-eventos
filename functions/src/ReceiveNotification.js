const functions = require("firebase-functions");
const { db } = require("../firebaseAdmin");

exports.receiveNotification = functions.https.onRequest(async (req, res) => {
  console.log("Received a request:", req.method, req.body);

  if (req.method !== "POST") {
    console.log("Method Not Allowed");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { QRId, Gloss, sourceBankId, originName, VoucherId, TransactionDateTime, additionalData } = req.body;
    console.log("Received data:", { QRId, Gloss, sourceBankId, originName, VoucherId, TransactionDateTime, additionalData });

    if (!QRId || !Gloss || !sourceBankId || !originName || !VoucherId || !TransactionDateTime) {
      console.log("Missing required data fields");
      return res.status(400).json({ success: false, message: "Missing required data fields" });
    }

    // Buscar el cliente con el QRId recibido
    const clientsQuery = db.collection("clientes").where("qrId", "==", QRId);
    const clientsSnapshot = await clientsQuery.get();

    if (clientsSnapshot.empty) {
      console.log("No client found with the given QRId:", QRId);
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    // Asumiendo que hay un único cliente con el QRId dado
    const clientDoc = clientsSnapshot.docs[0];

    // Actualizar el estado de pago en el documento del cliente
    await clientDoc.ref.update({ paymentStatus: true });
    console.log("Client payment status updated for QRId:", QRId);

    // No guardar nueva información en la colección 'clientes' o cualquier otra colección adicional
    // Simplemente confirmamos que se actualizó el estado de pago
    return res.status(200).json({ success: true, message: "Payment status updated successfully" });
  } catch (error) {
    console.error("Error processing notification:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});
