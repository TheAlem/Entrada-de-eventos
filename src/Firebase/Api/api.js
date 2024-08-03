import axios from 'axios';

const API_URL = '/api/ClientAuthentication.API/api/v1/auth/token';
const accountId = 'K103DKpylBrjkZzpkWtpew==';
const authorizationId = 'CcVmKbqor00puc/sx/mwugL6sfEhhXWnfjENnWz7aa0=';

let authToken = null;
let tokenExpiry = null;

export const getAuthToken = async () => {
  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  const response = await axios.post(API_URL, {
    accountId,
    authorizationId
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  authToken = response.data.message;
  tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000); // Token expiry (1 hour)
  return authToken;
};

export const generateQR = async (paymentDetails) => {
  const token = await getAuthToken();
  
  const response = await axios.post('/api/QRSimple.API/api/v1/main/getQRWithImageAsync', paymentDetails, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};
