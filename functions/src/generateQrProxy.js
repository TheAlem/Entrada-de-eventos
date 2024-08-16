const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors");

// Crea un middleware de CORS
const corsHandler = cors({ origin: true });

// Proxy para la generación de QR
exports.generateQrProxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Extraer los detalles de pago y el token de autenticación del cuerpo de la solicitud
      const { paymentDetails, authToken } = req.body;

      // Hacer la solicitud a la API de generación de QR
      const response = await axios.post("https://marketapi.bnb.com.bo/QRSimple.API/api/v1/main/getQRWithImageAsync", paymentDetails, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });

      // Enviar la respuesta al cliente
      res.json(response.data);
    } catch (error) {
      console.error("Error al generar el QR:", error.message);
      res.status(error.response ? error.response.status : 500).json({ error: "Error al generar el QR" });
    }
  });
});
