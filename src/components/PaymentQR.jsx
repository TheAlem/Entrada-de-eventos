import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { generateQR } from '../Firebase/Api/api';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { listenToFirestoreUpdates } from '../Firebase/PersonalData/BkForm';
import ClipLoader from 'react-spinners/ClipLoader';
import 'tailwindcss/tailwind.css';

const PaymentQR = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const checkExistingPayment = async (clientToken) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'clientes', clientToken);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists() && docSnapshot.data().paymentStatus) {
        navigate(`/entry/${clientToken}`);
        return true;
      }
      return false;
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
      const paymentAmount = clientData.academicLevel === 'Student' ? "150" : "0.01";
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
      await savePaymentInfo(data, clientData.token);
      checkPaymentStatus(clientData.token);
    } catch (err) {
      setError(`Error al generar el QR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (qrData, clientToken) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'payments', clientToken);
      await setDoc(docRef, {
        ...qrData,
        token: clientToken,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error al guardar la información del pago:', err);
    }
  };

  const checkPaymentStatus = async (clientToken) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'clientes', clientToken);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists() && docSnapshot.data().paymentStatus) {
        navigate(`/entry/${clientToken}`);
      } else {
        setTimeout(() => checkPaymentStatus(clientToken), 5000);
      }
    } catch (err) {
      setError('Error al verificar el estado de pago.');
      console.error('Error en checkPaymentStatus:', err);
    }
  };

  useEffect(() => {
    const fetchClientData = async () => {
      listenToFirestoreUpdates(async (clients) => {
        const currentClient = clients.find(client => client.token === localStorage.getItem('userToken'));
        if (currentClient) {
          const paymentCompleted = await checkExistingPayment(currentClient.token);
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
  }, []);

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
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">QR de Pago</h2>
        {loading ? (
          <div className="flex flex-col items-center">
            <ClipLoader size={50} color={"#4CAF50"} loading={loading} />
            <p className="mt-4 text-lg font-medium text-gray-700">Generando QR...</p>
          </div>
        ) : (
          <>
            {qrData && qrData.qr ? (
              <div className="mt-8 flex justify-center">
                <img src={`data:image/png;base64,${qrData.qr}`} alt="QR Code" className="w-64 h-64 object-contain border-2 border-gray-300 rounded-lg shadow-md" />
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-700 text-center">No se pudo generar el QR</div>
            )}
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg text-center">
                {error}
                <p className="mt-4">
                  <Link to="/personal-data" className="text-green-700 hover:text-gren-900 underline">
                    Haz clic aquí para volver al formulario
                  </Link>
                </p>
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
