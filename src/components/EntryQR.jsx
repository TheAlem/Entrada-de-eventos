import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../Firebase/firebase-config';
import { query, where, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import { ClipLoader } from 'react-spinners';

import backgroundImage from '../assets/images/E-ticket.png';

const EntryQR = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const q = query(collection(db, 'clientes'), where("token", "==", token));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const entryData = doc.data();
            entryData.id = doc.id;
            if (entryData.paymentStatus) {
              setEntry(entryData);
              triggerSendEmail(entryData);
            } else {
              setHasPaid(false);
            }
          });
        } else {
          throw new Error("No encontramos tu información. Asegúrate de haber ingresado el token correctamente.");
        }
      } catch (err) {
        setError(`Hubo un problema al cargar tu información: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [token]);

  const triggerSendEmail = async (entryData) => {
    try {
      const docRef = doc(db, 'clientes', entryData.id);
      await setDoc(docRef, entryData, { merge: true });
    } catch (error) {
      setError(`Hubo un problema al enviar el correo: ${error.message}`);
    }
  };

  const handleDownload = async () => {
    try {
      if (downloadCount < 15) {
        const element = document.querySelector("#ticketContainer");
        await new Promise(r => setTimeout(r, 500));
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: true,
          windowWidth: 1200,
          windowHeight: 800
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `Ticket-${entry.firstName}-${entry.lastName}.png`;
        link.click();
        setDownloadCount(downloadCount + 1);
      } else {
        alert("Has alcanzado el límite de descargas. Si necesitas más ayuda, por favor contacta soporte.");
      }
    } catch (error) {
      setError(`Ocurrió un problema al descargar tu ticket: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#4CAF50"} loading={loading} />
        <p className="ml-5 text-lg text-green-600">Estamos cargando tu información, por favor espera...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen p-5 text-center">
        <div className="bg-red-100 rounded-lg p-5 shadow-md">
          <h2 className="text-2xl text-red-700 mb-4">¡Ups! Algo salió mal</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-red-600 mt-2">Si sigues teniendo problemas, <a href="/personal-data" className="text-green-800 underline">haz clic aquí para volver a ingresar tus datos</a>.</p>
        </div>
      </div>
    );
  }

  if (!hasPaid) {
    return (
      <div className="flex justify-center items-center h-screen p-5 text-center">
        <div className="bg-orange-100 rounded-lg p-5 shadow-md">
          <h2 className="text-2xl text-orange-700 mb-4">Pago no completado</h2>
          <p className="text-orange-600">Parece que no has completado el pago. No te preocupes, puedes hacerlo ahora mismo.</p>
          <button
            className="mt-5 px-5 py-2 bg-green-500 text-white text-lg rounded-md cursor-pointer hover:bg-green-600"
            onClick={() => navigate(`/payment/${token}`)}
          >
            Ir a la página de pago
          </button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  const isStudent = entry.academicLevel === 'Student';
  const bgColor = isStudent ? 'bg-green-50' : 'bg-blue-50';
  const textColor = isStudent ? 'text-green-800' : 'text-blue-800';

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 justify-center p-2 md:p-5">
      <div id="ticketContainer" className="relative w-full max-w-4xl overflow-hidden">
        <div className="aspect-[12/9] w-full">
          <img src={backgroundImage} alt="Ticket background" className="w-full h-full object-cover rounded-xl" />
          <div className="absolute inset-0 flex items-center justify-end" style={{ paddingRight: '10%' }}>
            <div className="w-[55%] h-[70%] bg-white bg-opacity-90 rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-[2%]">
                <h2 className={`text-[2vw] md:text-[1.5vw] font-bold ${textColor} text-center`}>{entry.firstName} {entry.lastName}</h2>
                <p className={`text-[1.5vw] md:text-[1vw] ${textColor} text-center`}><strong>Email:</strong> {entry.email}</p>
                <p className={`text-[1.5vw] md:text-[1vw] ${textColor} text-center`}><strong>Teléfono:</strong> {entry.phone}</p>
                {isStudent ? (
                  <p className={`text-[1.5vw] md:text-[1vw] ${textColor} text-center`}><strong>Universidad:</strong> {entry.universityName}</p>
                ) : (
                  <>
                    <p className={`text-[1.5vw] md:text-[1vw] ${textColor} text-center`}><strong>Profesión:</strong> {entry.profession}</p>
                    <p className={`text-[1.5vw] md:text-[1vw] ${textColor} text-center`}><strong>Empresa:</strong> {entry.companyName}</p>
                  </>
                )}
              </div>
              <div className="flex flex-col items-center">
                <p className={`text-[2vw] md:text-[1.5vw] font-bold ${textColor} text-center`}>20 AGO 2024 | 8:30 AM</p>
                <p className={`text-[1.5vw] md:text-[1vw] ${textColor} text-center`}>Hotel Los Tajibos</p>
                <div className="mt-[2%] w-[30%] aspect-square">
                  <QRCode
                    value={JSON.stringify({
                      firstName: entry.firstName,
                      lastName: entry.lastName,
                      email: entry.email,
                      phone: entry.phone,
                      academicLevel: entry.academicLevel,
                      profession: entry.profession,
                      token: entry.token,
                      paymentStatus: entry.paymentStatus
                    })}
                    size={250}
                    level="H"
                    includeMargin={false}
                    renderAs="svg"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className="mt-6 px-4 md:px-6 py-2 md:py-3 bg-green-500 text-white text-sm md:text-lg rounded-lg cursor-pointer hover:bg-green-600 shadow-sm w-full max-w-xs"
        onClick={handleDownload}
      >
        Descargar Ticket
      </button>
    </div>
  );
};

export default EntryQR;
