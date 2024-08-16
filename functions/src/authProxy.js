const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors");

// Crea un middleware de CORS
const corsHandler = cors({ origin: true });

// Proxy para la autenticación
exports.authProxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Extraer los datos necesarios del cuerpo de la solicitud
      const { accountId, authorizationId } = req.body;

      // Hacer la solicitud a la API de autenticación
      const response = await axios.post("https://marketapi.bnb.com.bo/ClientAuthentication.API/api/v1/auth/token", {
        accountId,
        authorizationId,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Enviar la respuesta al cliente
      res.json(response.data);
    } catch (error) {
      console.error("Error al obtener el token:", error.message);
      res.status(error.response ? error.response.status : 500).json({ error: "Error al obtener el token de autenticación" });
    }
  });
});
