import React, { useState, useEffect } from 'react';
import { generateQR } from '../Firebase/Api/api';
import 'tailwindcss/tailwind.css';

const PaymentQR = () => {
  const [qrData, setQrData] = useState(localStorage.getItem('qrData'));
  const [loading, setLoading] = useState(!qrData);
  const [error, setError] = useState('');

  const handleGenerateQR = async () => {
    setLoading(true);
    setError('');
    try {
      const paymentDetails = {
        currency: 'BOB',
        gloss: 'Pago Entrada Evento',
        amount: 100,
        singleUse: true,
        expirationDate: '2024-08-10',
        additionalData: 'Datos Adicionales'
      };
      const data = await generateQR(paymentDetails);
      setQrData(data.qr);
      localStorage.setItem('qrData', data.qr); // Almacenar el QR en el almacenamiento local
    } catch (err) {
      setError('Error al generar el QR');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!qrData) {
      handleGenerateQR();
    }
  }, [qrData]);

  const handleDownloadQR = () => {
    if (qrData) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrData}`;
      link.download = 'qr_code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Generar QR de Pago</h2>
        {loading ? (
          <div className="text-lg font-semibold text-gray-700">Generando...</div>
        ) : (
          <>
            {qrData && (
              <div className="mt-8">
                <img src={`data:image/png;base64,${qrData}`} alt="QR Code" className="w-96 h-96 object-contain" />
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-100 text-red-800 p-4 rounded-lg">
                {error}
              </div>
            )}
            <div className="flex mt-6 space-x-4">
              {qrData && (
                <button
                  onClick={handleDownloadQR}
                  className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
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
