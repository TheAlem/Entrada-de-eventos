import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../Firebase/firebase-config';
import { query, where, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import { ClipLoader } from 'react-spinners';

import backgroundImage from '../assets/images/E-ticket.png'; // Asume que tienes esta imagen en tu proyecto

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
      if (downloadCount < 2) {
        const element = document.querySelector("#ticketContainer");
        await new Promise(r => setTimeout(r, 500));
        const canvas = await html2canvas(element, {
          scale: 5,
          useCORS: true
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader size={50} color={"#4CAF50"} loading={loading} />
        <p style={{ marginLeft: '20px', fontSize: '18px', color: '#4CAF50' }}>Estamos cargando tu información, por favor espera...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#ffebee', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', color: '#d32f2f', marginBottom: '16px' }}>¡Ups! Algo salió mal</h2>
          <p style={{ fontSize: '16px', color: '#c62828' }}>{error}</p>
          <p style={{ fontSize: '16px', color: '#c62828' }}>Si sigues teniendo problemas, <a href="/personal-data" style={{ color: '#183c33', textDecoration: 'underline' }}>haz clic aquí para volver a ingresar tus datos</a>.</p>
        </div>
      </div>
    );
  }

  if (!hasPaid) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#fff3e0', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', color: '#ef6c00', marginBottom: '16px' }}>Pago no completado</h2>
          <p style={{ fontSize: '16px', color: '#e65100' }}>Parece que no has completado el pago. No te preocupes, puedes hacerlo ahora mismo.</p>
          <button
            style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', fontSize: '16px', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}
            onClick={() => navigate(`/payment/${token}`)}
          >
            Ir a la página de pago
          </button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6', justifyContent: 'center', padding: '20px' }}>
      <div id="ticketContainer" style={{
        width: '100%',
        maxWidth: '1000px',
        height: '750px', // Altura fija para asegurar scroll en móviles
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '24px',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden', // Oculta el scroll en pantallas grandes
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          transform: 'translateY(-50%)',
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0D47A1', marginBottom: '8px', textAlign: 'center' }}>{entry.firstName} {entry.lastName}</h2>
          <p style={{ fontSize: '16px', color: '#0D47A1', marginBottom: '4px', textAlign: 'center' }}><strong>Email:</strong> {entry.email}</p>
          <p style={{ fontSize: '16px', color: '#0D47A1', marginBottom: '4px', textAlign: 'center' }}><strong>Teléfono:</strong> {entry.phone}</p>
          <p style={{ fontSize: '16px', color: '#0D47A1', marginBottom: '4px', textAlign: 'center' }}><strong>Profesión:</strong> {entry.profession}</p>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#0D47A1', marginTop: '8px', textAlign: 'center' }}>20 AGO 2024 | 8:00 AM</p>
          <p style={{ fontSize: '16px', color: '#0D47A1', textAlign: 'center' }}>Santa Cruz de la Sierra</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
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
              size={300}
              level="H"
              includeMargin={false}
              renderAs="svg"
            />
          </div>
        </div>
      </div>
      <button
        style={{
          padding: '12px 24px',
          backgroundColor: '#4CAF50',
          color: 'white',
          fontSize: '16px',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '24px',
          border: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '200px'
        }}
        onClick={handleDownload}
      >
        Descargar Ticket
      </button>
    </div>
  );
};

export default EntryQR;
