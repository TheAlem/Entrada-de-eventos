import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { generateQR } from '../Firebase/Api/api';
import { getFirestore, doc, setDoc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore';
import ClipLoader from 'react-spinners/ClipLoader';
import 'tailwindcss/tailwind.css';

const PaymentQR = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const checkPaymentStatus = async (clientToken) => {
    try {
      const db = getFirestore();
      const clientsQuery = query(collection(db, 'clientes'), where('token', '==', clientToken));
      const clientsSnapshot = await getDocs(clientsQuery);

      if (!clientsSnapshot.empty) {
        const clientDoc = clientsSnapshot.docs[0];
        const paymentStatus = clientDoc.data().paymentStatus;
        if (paymentStatus === true) {
          navigate(`/entry/${clientToken}`);
        } else {
          setTimeout(() => checkPaymentStatus(clientToken), 5000);
        }
      } else {
        setError('No se encontró información del cliente.');
      }
    } catch (err) {
      setError('Error al verificar el estado de pago.');
      console.error('Error en checkPaymentStatus:', err);
    }
  };

  const handleGenerateQR = async (clientData) => {
    setLoading(true);
    setError('');
    try {
      if (!clientData.qrId) { // Solo generar un nuevo QR si no existe
        const paymentAmount = clientData.academicLevel === 'Student' ? "100" : "200";
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
        await updateClientQRId(clientData.token, data.qrId); // Actualizar el QRId en el documento existente en la colección 'clientes'
      } else {
        setQrData({ qr: clientData.qrCode }); // Utilizar el QR existente
      }
    } catch (err) {
      setError(`Error al generar el QR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const updateClientQRId = async (clientToken, qrId) => {
    try {
      const db = getFirestore();
      const clientsQuery = query(collection(db, 'clientes'), where('token', '==', clientToken));
      const clientsSnapshot = await getDocs(clientsQuery);

      if (!clientsSnapshot.empty) {
        const clientDoc = clientsSnapshot.docs[0]; // Obtener el primer documento
        const clientRef = doc(db, 'clientes', clientDoc.id); // Obtener la referencia del documento usando su ID
        await updateDoc(clientRef, { qrId }); // Usar updateDoc para actualizar el campo qrId
        console.log("QRId actualizado en el documento del cliente.");
      } else {
        console.error("No se encontró el documento del cliente con el token proporcionado.");
      }
    } catch (err) {
      console.error('Error al actualizar el QRId del cliente:', err);
    }
  };

  useEffect(() => {
    const fetchClientData = async () => {
      const clientToken = localStorage.getItem('userToken');
      const db = getFirestore();
      const clientsQuery = query(collection(db, 'clientes'), where('token', '==', clientToken));
      const clientsSnapshot = await getDocs(clientsQuery);

      if (!clientsSnapshot.empty) {
        const clientDoc = clientsSnapshot.docs[0];
        const clientData = clientDoc.data();
        await handleGenerateQR(clientData);
        checkPaymentStatus(clientToken);
      } else {
        setError("No se encontró información del cliente.");
        setLoading(false);
      }
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
                  <Link to="/personal-data" className="text-green-700 hover:text-green-900 underline">
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
