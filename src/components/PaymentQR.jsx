import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQR, getQRStatus, refreshTokenIfNeeded } from '../Firebase/Api/api';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import 'tailwindcss/tailwind.css';

const PaymentQR = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentChecked, setPaymentChecked] = useState(false);
  const navigate = useNavigate();

  const handleGenerateQR = async () => {
    setLoading(true);
    setError('');
    try {
      await refreshTokenIfNeeded();
      const paymentDetails = {
        currency: "BOB",
        gloss: "Pago Entrada Evento",
        amount: "0.01",
        singleUse: "true",
        expirationDate: "2024-09-01", 
        additionalData: "Datos Adicionales - ${new Date().toISOString()}"
      };      
      const data = await generateQR(paymentDetails);
      setQrData(data);
      await savePaymentInfo(data);
    } catch (err) {
      setError(`Error al generar el QR: ${err.message}`);
      console.error('Error en handleGenerateQR:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInfo = async (qrData) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'payments', qrData.id);
      await setDoc(docRef, qrData);
      console.log('Información del pago guardada en Firestore');
    } catch (err) {
      console.error('Error al guardar la información del pago:', err);
      // Considera si quieres manejar este error de alguna manera específica
    }
  };

  const handleCheckPayment = async () => {
    setError('');
    setPaymentChecked(false);
    try {
      await refreshTokenIfNeeded();
      const { id } = qrData;
      const qrStatus = await getQRStatus(id);
      if (qrStatus.statusId === 2) { // statusId 2 indica que el QR ha sido usado/pagado
        navigate('/entry');
      } else {
        setError('El pago no ha sido realizado o el QR no es válido');
        setPaymentChecked(true);
      }
    } catch (err) {
      setError(`Error al verificar el estado del pago: ${err.message}`);
      console.error('Error en handleCheckPayment:', err);
    }
  };

  useEffect(() => {
    handleGenerateQR();
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
                <>
                  <button
                    onClick={handleDownloadQR}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    Descargar QR
                  </button>
                  <button
                    onClick={handleCheckPayment}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    He realizado el pago
                  </button>
                </>
              )}
            </div>
            {paymentChecked && (
              <div className="mt-4 text-lg font-semibold text-red-600 text-center">
                Verificación de pago fallida. Asegúrate de haber realizado el pago.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentQR;