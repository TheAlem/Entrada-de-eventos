import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateQR } from '../Firebase/Api/api';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import 'tailwindcss/tailwind.css';

const PaymentQR = () => {
  const { token } = useParams(); // Obtén el token desde la URL
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkExistingPayment = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'clientes', token.trim());
      console.log('Consultando Firestore con el token:', token.trim()); // Log adicional
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log('Documento encontrado:', data);
        if (data.paymentStatus) {
          navigate(`/entry/${token.trim()}`, { replace: true });
          return true;
        }
      } else {
        console.error('No se encontró el documento para el token:', token.trim());
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
      checkPaymentStatus();
    } catch (err) {
      setError(`Error al generar el QR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (qrData) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'payments', token.trim());
      await setDoc(docRef, {
        ...qrData,
        token: token.trim(),
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error al guardar la información del pago:', err);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'clientes', token.trim());
      console.log('Verificando token:', token.trim()); // Log adicional
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const paymentStatus = docSnapshot.data().paymentStatus;
        if (paymentStatus) {
          navigate(`/entry/${token.trim()}`, { replace: true });
        } else {
          setTimeout(checkPaymentStatus, 5000);
        }
      } else {
        console.error('Cliente no encontrado para el token:', token.trim());
        setError('Cliente no encontrado.');
        setLoading(false);
      }
    } catch (err) {
      setError('Error al verificar el estado de pago.');
      console.error('Error en checkPaymentStatus:', err);
    }
  };

  useEffect(() => {
    const fetchClientData = async () => {
      console.log('Intentando obtener datos del cliente con el token:', token.trim()); // Log adicional
      const db = getFirestore();
      const docRef = doc(db, 'clientes', token.trim());
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const currentClient = docSnapshot.data();
        const paymentCompleted = await checkExistingPayment();
        if (!paymentCompleted) {
          handleGenerateQR(currentClient);
        }
        checkPaymentStatus();
      } else {
        console.error('No se encontró información del cliente con el token:', token.trim());
        setError("No se encontró información del cliente.");
        setLoading(false);
      }
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
