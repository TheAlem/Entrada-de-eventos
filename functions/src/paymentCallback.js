const functions = require("firebase-functions");
const { db } = require("../firebaseAdmin"); // Asegúrate de tener bien configurada tu instancia de Firebase Admin SDK

exports.paymentCallback = functions.https.onRequest(async (req, res) => {
  console.log("Datos recibidos en la consulta (query):", req.query);

  // Permitir solicitudes desde cualquier origen (CORS)
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Content-Type", "application/json");

  // Aceptamos solo solicitudes POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método no permitido" });
  }

  // Extraemos los datos que envía PagoFacil en la consulta (POST)
  const { PedidoID, Fecha, Hora, MetodoPago, Estado } = req.body;

  // Validar que todos los campos requeridos están presentes
  if (!PedidoID || !Fecha || !Hora || !MetodoPago || !Estado) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos necesarios",
      missing: {
        PedidoID: !PedidoID,
        Fecha: !Fecha,
        Hora: !Hora,
        MetodoPago: !MetodoPago,
        Estado: !Estado,
      },
    });
  }

  try {
    // Buscar el cliente usando PedidoID en lugar de qrId
    const clientsQuery = db.collection("clientes").where("PedidoID", "==", PedidoID);
    const clientsSnapshot = await clientsQuery.get();

    // Si no se encuentra ningún cliente con el PedidoID proporcionado
    if (clientsSnapshot.empty) {
      console.log("No se encontró ningún cliente con el PedidoID:", PedidoID);
      return res.status(404).json({ success: false, message: "Cliente no encontrado" });
    }

    // Asumimos que solo hay un cliente con el PedidoID dado (debería ser único)
    const clientDoc = clientsSnapshot.docs[0];

    // Si el estado es '2' (indicando que el pago fue confirmado por PagoFacil)
    if (Estado === "2") {
      // Actualizamos el estado de pago del cliente en Firestore
      await clientDoc.ref.update({
        paymentStatus: true,
        paymentDetails: {
          PedidoID,
          Fecha,
          Hora,
          MetodoPago,
          Estado,
        },
      });
      console.log("Estado de pago actualizado correctamente para el cliente con PedidoID:", PedidoID);

      // Devolvemos una respuesta de éxito
      return res.status(200).json({
        success: true,
        message: "Estado de pago actualizado correctamente",
      });
    } else {
      // Si el estado no es '2', el pago no se completó
      return res.status(200).json({
        success: false,
        message: "Pago no completado o rechazado",
      });
    }
  } catch (error) {
    // Si ocurre algún error durante el proceso, devolvemos un error 500
    console.error("Error al procesar el pago:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});
