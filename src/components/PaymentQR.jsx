import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { generateQRCode } from '../Firebase/Api/Controller/PagoFacil';
import { getFirestore, query, where, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import ClipLoader from 'react-spinners/ClipLoader';
import 'tailwindcss/tailwind.css';
import { FiDownload } from 'react-icons/fi';
import { AiOutlineCheckCircle } from 'react-icons/ai';

const PaymentQR = () => {
  const [qrImage, setQRImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
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
          setPaymentConfirmed(true);
          setTimeout(() => navigate(`/entry/${clientToken}`), 3000);
        } else {
          setTimeout(() => checkPaymentStatus(clientToken), 2000);
        }
      } else {
        setError('No se encontró información del cliente.');
      }
    } catch (err) {
      setError(`Error al verificar el estado de pago: ${err.message}`);
    }
  };

  const handleGenerateQR = async (clientToken) => {
    setLoading(true);
    setError('');
    setQRImage('');

    try {
      if (!clientToken) {
        throw new Error('Token no disponible. Por favor, intenta nuevamente.');
      }

      generateQRCode(clientToken, setQRImage, {
        onSuccess: async (PedidoID, qrCode) => {
          await updateClientPaymentInfo(clientToken, PedidoID, qrCode);
          checkPaymentStatus(clientToken);
          setLoading(false);
        },
        onError: (errorMessage) => {
          setError(`Error al generar el QR:${errorMessage}`);
          setLoading(false);
        },
      });
    } catch (err) {
      setError(`Error al generar el QR: ${err.message}`);
      setLoading(false);
    }
  };

  const updateClientPaymentInfo = async (clientToken, PedidoID, qrCode) => {
    try {
      const db = getFirestore();
      const clientsQuery = query(collection(db, 'clientes'), where('token', '==', clientToken));
      const clientsSnapshot = await getDocs(clientsQuery);

      if (!clientsSnapshot.empty) {
        const clientDoc = clientsSnapshot.docs[0];
        const clientRef = doc(db, 'clientes', clientDoc.id);

        await updateDoc(clientRef, {
          PedidoID,
          qrCode: qrCode,
        });
      } else {
        setError('No se encontró información del cliente para actualizar.');
      }
    } catch (error) {
      setError(`Error al actualizar la información del cliente: ${error.message}`);
    }
  };

  useEffect(() => {
    const clientToken = localStorage.getItem('userToken');

    if (!clientToken) {
      setError('Token no encontrado. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }

    handleGenerateQR(clientToken);
  }, []);

  const handleDownloadQR = () => {
    if (qrImage) {
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = 'qr_code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setError('QR no disponible para descargar.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white relative rounded-3xl shadow-xl p-6 sm:p-10 max-w-xl w-full">
        {/* Encabezado */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Completa tu Pago</h2>
        <p className="text-gray-600 text-center mb-6">
          Escanea el código QR para realizar tu pago de forma segura y rápida.
        </p>

        {loading ? (
          <div className="flex flex-col items-center">
            <ClipLoader size={50} color={"#4CAF50"} loading={loading} />
            <p className="mt-4 text-lg font-medium text-gray-700 text-center">
              Generando QR, por favor espera...
            </p>
          </div>
        ) : error ? (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg text-center">
            {error}
            <p className="mt-4">
              <Link to="/personal-data" className="text-green-700 hover:text-green-900 underline">
                Haz clic aquí para volver al formulario
              </Link>
            </p>
          </div>
        ) : paymentConfirmed ? (
          <div className="flex flex-col items-center">
            <AiOutlineCheckCircle className="text-green-600" size={80} />
            <p className="mt-4 text-xl font-semibold text-gray-800 text-center">
              ¡Pago confirmado!
            </p>
            <p className="text-gray-600 text-center mt-2">
              Serás redirigido automáticamente.
            </p>
          </div>
        ) : (
          <>
            {/* Imagen del QR */}
            {qrImage ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={qrImage}
                    alt="Código QR"
                    className="w-full max-w-xs sm:max-w-sm object-contain border-2 border-gray-200 rounded-lg shadow-md"
                  />
                  {/* Botón de descarga */}
                  <button
                    onClick={handleDownloadQR}
                    className="mt-4 w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition"
                  >
                    <div className="flex items-center justify-center">
                      <FiDownload className="mr-2" size={24} />
                      Descargar QR
                    </div>
                  </button>
                </div>
                {/* Información adicional */}
                <div className="mt-6 text-center">
                  <p className="text-gray-700">
                    Abre tu aplicación bancaria o de pagos y escanea el código para completar la transacción.
                  </p>
                  <p className="text-gray-500 mt-2">
                    Una vez realizado el pago, mostraremos su entrada de forma automatica.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-700 text-center mt-6">
                No se pudo generar el QR
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentQR;