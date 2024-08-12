import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQR } from '../Firebase/Api/api';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { listenToFirestoreUpdates } from '../Firebase/PersonalData/BkForm';
import { useToken } from '../Firebase/context/TokenContext'; // Import the hook
import 'tailwindcss/tailwind.css';

const PaymentQR = () => {
  const navigate = useNavigate();
  const { token } = useToken(); // Use the token from context
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkExistingPayment = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'clientes', token);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists() && docSnapshot.data().paymentStatus) {
        navigate(`/entry/${token}`, { replace: true });
        return true; // Return true if payment is already completed
      }
      return false; // Return false if payment is not completed
    } catch (err) {
      setError('Error al verificar el estado de pago.');
      console.error('Error en checkExistingPayment:', err);
      return false;
    }
  };

  const handleGenerateQR = async (clientData) => {
    setLoading(true);
    setError('');
    try {
      const paymentAmount = clientData.academicLevel === 'Student' ? "150" : "300";
      const paymentDetails = {
        currency: "BOB",
        gloss: "Pago Entrada Evento",
        amount: paymentAmount,
        singleUse: "true",
        expirationDate: "2024-09-01", 
        additionalData: `Datos Adicionales - ${new Date().toISOString()}`
      };      
      const data = await generateQR(paymentDetails);
      setQrData(data);
      await savePaymentInfo(data);
      checkPaymentStatus(); // Revisa el estado del pago
    } catch (err) {
      setError(`Error al generar el QR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (qrData) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'payments', token);
      await setDoc(docRef, {
        ...qrData,
        token,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error al guardar la información del pago:', err);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'clientes', token);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists() && docSnapshot.data().paymentStatus) {
        navigate(`/entry/${token}`, { replace: true });
      } else {
        setTimeout(checkPaymentStatus, 5000); // Retry after 5 seconds
      }
    } catch (err) {
      setError('Error al verificar el estado de pago.');
      console.error('Error en checkPaymentStatus:', err);
    }
  };

  useEffect(() => {
    const fetchClientData = async () => {
      listenToFirestoreUpdates(async (clients) => {
        const currentClient = clients.find(client => client.token === token);
        if (currentClient) {
          const paymentCompleted = await checkExistingPayment();
          if (!paymentCompleted) {
            handleGenerateQR(currentClient);
          }
        } else {
          setError("No se encontró información del cliente.");
          setLoading(false);
        }
      });
    };
    fetchClientData();
  }, [token, navigate]);

  const handleDownloadQR = () => {
    if (qrData && qrData.qr) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrData.qr}`;
      link.download = 'qr_code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">QR de Pago</h2>
        {loading ? (
          <div className="text-lg font-semibold text-gray-700 text-center">Generando QR...</div>
        ) : (
          <>
            {qrData && qrData.qr ? (
              <div className="mt-8 flex justify-center">
                <img src={`data:image/png;base64,${qrData.qr}`} alt="QR Code" className="w-64 h-64 object-contain" />
              </div>
            ) : (
              <div className="text-lg font-semibold text-gray-700 text-center">No se pudo generar el QR</div>
            )}
            {error && (
              <div className="mt-4 bg-red-100 text-red-800 p-4 rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="flex flex-col mt-6 space-y-4">
              {qrData && qrData.qr && (
                <button
                  onClick={handleDownloadQR}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Descargar QR
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentQR;
