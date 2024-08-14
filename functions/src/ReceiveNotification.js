const functions = require("firebase-functions");
const { admin, db } = require("../firebaseAdmin");

exports.receiveNotification = functions.https.onRequest(async (req, res) => {
  console.log("Received a request:", req.method, req.body); // Log para ver la solicitud recibida

  if (req.method !== "POST") {
    console.log("Method Not Allowed"); // Log cuando el método no es POST
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { QRId, Gloss, sourceBankId, originName, VoucherId, TransactionDateTime, additionalData } = req.body;

    // Log para ver los datos recibidos
    console.log("Received data:", { QRId, Gloss, sourceBankId, originName, VoucherId, TransactionDateTime, additionalData });

    if (!QRId || !Gloss || !sourceBankId || !originName || !VoucherId || !TransactionDateTime) {
      console.log("Missing required data fields"); // Log cuando faltan campos
      return res.status(400).json({ success: false, message: "Missing required data fields" });
    }

    const paymentData = {
      QRId,
      Gloss,
      sourceBankId,
      originName,
      VoucherId,
      TransactionDateTime,
      additionalData: additionalData || "",
      status: "paid",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const paymentRef = db.collection("payments").doc(QRId);

    const docSnapshot = await paymentRef.get();
    if (docSnapshot.exists) {
      console.log("Notification already processed"); // Log cuando la notificación ya fue procesada
      return res.status(200).json({ success: true, message: "Notification already processed" });
    }

    await paymentRef.set(paymentData);
    console.log("Payment data saved:", paymentData); // Log cuando los datos de pago se guardan

    const clientRef = db.collection("clientes").doc(QRId);
    await clientRef.update({ paymentStatus: true });
    console.log("Client payment status updated for QRId:", QRId); // Log cuando el estado de pago del cliente se actualiza

    return res.status(200).json({ success: true, message: "Notification received and processed successfully" });
  } catch (error) {
    console.error("Error processing notification:", error); // Log cuando hay un error
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});
