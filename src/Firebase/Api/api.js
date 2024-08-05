import axios from 'axios';

const API_URL = '/api/ClientAuthentication.API/api/v1/auth/token';
const GENERATE_QR_URL = '/api/QRSimple.API/api/v1/main/getQRWithImageAsync';
const GET_QR_STATUS_URL = '/api/QRSimple.API/api/v1/main/getQRStatusAsync';

const accountId = 'K103DKpylBrjkZzpkWtpew==';
const authorizationId = 'RevistaBolivia123*';

let authToken = null;
let tokenExpiration = null;

export const getAuthToken = async () => {
  if (authToken && tokenExpiration && new Date() < tokenExpiration) {
    return authToken;
  }

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
      tokenExpiration = new Date(new Date().getTime() + 60 * 60 * 1000);
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

export const getQRStatus = async (qrId) => {
  try {
    const authToken = await getAuthToken();

    const response = await axios.post(GET_QR_STATUS_URL, { qrId }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data && response.data.success) {
      return {
        id: response.data.id,
        statusId: response.data.statusId,
        expirationDate: response.data.expirationDate,
        voucherId: response.data.voucherId
      };
    } else {
      throw new Error(response.data.message || 'No se pudo obtener el estado del QR');
    }
  } catch (error) {
    console.error('Error al obtener el estado del QR:', error);
    throw new Error('No se pudo obtener el estado del QR: ' + (error.response?.data?.message || error.message));
  }
};

export const refreshTokenIfNeeded = async () => {
  if (!authToken || !tokenExpiration || new Date() >= tokenExpiration) {
    await getAuthToken();
  }
};