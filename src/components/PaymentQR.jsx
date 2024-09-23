import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { generateQRCode } from '../Firebase/Api/Controller/PagoFacil'; // Función para PagoFacil
import { getFirestore, query, where, collection, getDocs } from 'firebase/firestore';
import ClipLoader from 'react-spinners/ClipLoader';
import 'tailwindcss/tailwind.css';

const PaymentQR = () => {
  const [qrImage, setQRImage] = useState(''); // Base64 image string
  const [loading, setLoading] = useState(true); // Estado inicializado en true para mostrar el loader inicialmente
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
          setTimeout(() => checkPaymentStatus(clientToken), 5000); // Revisar el estado de pago cada 5 segundos
        }
      } else {
        setError('No se encontró información del cliente.');
      }
    } catch (err) {
      setError(`Error al verificar el estado de pago: ${err.message}`);
    }
  };

  const handleGenerateQR = async (clientToken) => {
    setLoading(true); // Mostrar el loader mientras se genera el QR
    setError('');
    setQRImage('');
  
    try {
      if (!clientToken) {
        throw new Error('Token no disponible. Por favor, intenta nuevamente.');
      }
  
      // Generar el QR utilizando el token del cliente con callbacks para manejar el éxito y error
      generateQRCode(clientToken, setQRImage, {
        onSuccess: () => {
          console.log('Código QR generado con éxito');
          checkPaymentStatus(clientToken); // Verificar el estado del pago tras generar el QR
          setLoading(false); // Desactivar el estado de carga
        },
        onError: (errorMessage) => {
          setError(`Error al generar el QR: ${errorMessage}`);
          setLoading(false); // Desactivar el estado de carga si hay un error
        }
      });
    } catch (err) {
      setError(`Error al generar el QR: ${err.message}`);
      setLoading(false); // Desactivar el estado de carga si hay un error
    }
  };

  useEffect(() => {
    const clientToken = localStorage.getItem('userToken'); // Obtener el token del usuario desde localStorage

    if (!clientToken) {
      setError('Token no encontrado. Por favor, inicia sesión nuevamente.');
      setLoading(false); // Desactivar el loader ya que no hay un token disponible
      return;
    }

    handleGenerateQR(clientToken); // Generar el QR al cargar el componente
  }, []);

  // Función para descargar el QR
  const handleDownloadQR = () => {
    if (qrImage) {
      // Crear un enlace temporal para descargar el QR
      const link = document.createElement('a');
      link.href = qrImage; // Aquí usamos el valor base64 directamente como href
      link.download = 'qr_code.png'; // Nombre del archivo
      document.body.appendChild(link); // Añadir el link al DOM
      link.click(); // Simular el clic
      document.body.removeChild(link); // Eliminar el link después de la descarga
    } else {
      setError('QR no disponible para descargar.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">QR de Pago</h2>
        {loading ? (
          <div className="flex flex-col items-center">
            <ClipLoader size={50} color={"#4CAF50"} loading={loading} />
            <p className="mt-4 text-lg font-medium text-gray-700">Generando QR, por favor espera...</p>
          </div>
        ) : (
          <>
            {qrImage ? (
              <div className="mt-8 flex justify-center">
                <img src={qrImage} alt="QR Code" className="w-100 h-100 object-contain border-2 border-gray-300 rounded-lg shadow-md" />
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
              {qrImage && (
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
