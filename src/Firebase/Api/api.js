import axios from 'axios';

const API_URL = 'https://us-central1-energiaboliviappandroid.cloudfunctions.net/authProxy';
const GENERATE_QR_URL = 'https://us-central1-energiaboliviappandroid.cloudfunctions.net/generateQrProxy';

const accountId = 'O6ukBL3PHvs950IPlkmGHA==';
const authorizationId = 'HvX+8+Gcd+c1pHj1qNHA5g==';

let authToken = null;

// Función para obtener el token de autenticación
const getAuthToken = async () => {
  try {
    const response = await axios.post(API_URL, {
      accountId,
      authorizationId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.success) {
      authToken = response.data.message;
      return authToken;
    } else {
      throw new Error(response.data.message || 'Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error('Error al obtener el token de autenticación:', error);
    throw new Error('No se pudo obtener el token de autenticación: ' + (error.response?.data?.message || error.message));
  }
};

// Función para generar el código QR
export const generateQR = async (paymentDetails) => {
  try {
    const authToken = await getAuthToken();

    const response = await axios.post(GENERATE_QR_URL, { paymentDetails, authToken }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data && response.data.success && response.data.qr) {
      return {
        qrId: response.data.id,  // Aquí se obtiene el ID del QR
        qr: response.data.qr
      };
    } else {
      throw new Error(response.data.message || 'Datos de QR inválidos recibidos');
    }
  } catch (error) {
    console.error('Error al generar el QR:', error);
    throw new Error('No se pudo generar el QR: ' + (error.response?.data?.message || error.message));
  }
};
