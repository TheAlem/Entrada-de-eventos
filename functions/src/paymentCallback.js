const functions = require("firebase-functions");
const { db } = require("../firebaseAdmin");

exports.paymentCallback = functions.https.onRequest(async (req, res) => {
  console.log("Datos recibidos en la consulta (query):", req.query);

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Content-Type", "application/json");

  // Verificar que el método de la solicitud sea POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método no permitido" });
  }

  // Asegúrate de que el cuerpo de la solicitud esté siendo interpretado como JSON
  const { PedidoID, Fecha, Hora, MetodoPago, Estado } = req.query;

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
    // Buscar el cliente usando PedidoID
    const clientsQuery = db.collection("clientes").where("PedidoID", "==", PedidoID);
    const clientsSnapshot = await clientsQuery.get();

    if (clientsSnapshot.empty) {
      console.log("No se encontró ningún cliente con el PedidoID:", PedidoID);
      return res.status(404).json({ success: false, message: "Cliente no encontrado" });
    }

    // Asumimos que solo hay un cliente con el PedidoID dado (debería ser único)
    const clientDoc = clientsSnapshot.docs[0];

    // Si el estado es '2' (indicando que el pago fue confirmado)
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
