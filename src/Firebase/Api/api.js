import axios from 'axios';

const API_URL = '/api/ClientAuthentication.API/api/v1/auth/token';
const GENERATE_QR_URL = '/api/QRSimple.API/api/v1/main/getQRWithImageAsync';

const accountId = 'O6ukBL3PHvs950IPlkmGHA==';
const authorizationId = 'HvX+8+Gcd+c1pHj1qNHA5g==';

let authToken = null;

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

export const generateQR = async (paymentDetails) => {
  try {
    const authToken = await getAuthToken();

    const response = await axios.post(GENERATE_QR_URL, paymentDetails, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data && response.data.success && response.data.qr) {
      return {
        id: response.data.id,
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
