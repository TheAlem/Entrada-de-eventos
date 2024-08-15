import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../Firebase/firebase-config';
import { query, where, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import { ClipLoader } from 'react-spinners'; // Importa el spinner desde react-spinners

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
      const docRef = doc(db, 'clientes', entryData.token);
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
          scale: 4,
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
        <ClipLoader size={50} color={"#4CAF50"} loading={loading} /> {/* Spinner */}
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
            onClick={() => navigate(`/payment/${token}`)} // Redirige a la página de pago
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

  const getColorStyles = (academicLevel) => {
    return academicLevel === "Student" ? {
      gradientStart: '#6cdb78',
      gradientEnd: '#21da35',
      textColor: '#23a03c',
      highlightColor: '#e4fbe8'
    } : {
      gradientStart: '#98d6f3',
      gradientEnd: '#42A5F5',
      textColor: '#0D47A1',
      highlightColor: '#E3F2FD'
    };
  };

  const colors = getColorStyles(entry.academicLevel);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
      <div id="ticketContainer" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ padding: '24px', background: `linear-gradient(to right, ${colors.gradientStart}, ${colors.gradientEnd})`, color: 'white' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>BOLIVIA BLOCKCHAIN SUMMIT</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px' }}>
            <p>2024</p>
            <span style={{ backgroundColor: 'white', color: colors.textColor, padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>
              {entry.academicLevel === "Student" ? 'Entrada Estudiante' : 'Entrada Profesional'}
            </span>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ backgroundColor: colors.highlightColor, borderRadius: '16px', padding: '16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textColor, marginBottom: '8px' }}>{entry.firstName} {entry.lastName}</h2>
            <p style={{ fontSize: '14px', color: colors.textColor }}><strong>Email:</strong> {entry.email}</p>
            <p style={{ fontSize: '14px', color: colors.textColor }}><strong>Teléfono:</strong> {entry.phone}</p>
            {entry.academicLevel === "Student" ? (
              <p style={{ fontSize: '14px', color: colors.textColor }}><strong>Universidad:</strong> {entry.universityName}</p>
            ) : (
              <p style={{ fontSize: '14px', color: colors.textColor }}><strong>Profesión:</strong> {entry.profession}</p>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textColor }}>20 AGO 2024 | 11:00 AM</p>
            <p style={{ fontSize: '16px', color: colors.textColor }}>Santa Cruz de la Sierra</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <QRCode 
              value={JSON.stringify({
                firstName: entry.firstName,
                lastName: entry.lastName,
                email: entry.email,
                phone: entry.phone,
                academicLevel: entry.academicLevel,
                universityName: entry.universityName || "",
                profession: entry.profession || "",
                companyName: entry.companyName || "",
                token: entry.token,
                paymentStatus: entry.paymentStatus
              })}
              size={256} // Aumenta el tamaño para una mayor resolución
              level="H"
              includeMargin={true}
              renderAs="svg" // Usa SVG para una mejor claridad
            />
          </div>

          <p style={{ fontSize: '12px', textAlign: 'center', color: '#9CA3AF', marginTop: '16px' }}>Un evento del Grupo CECAL SRL y la revista ENERGÍABolivia</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 'auto', padding: '20px' }}>
          <button 
            style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', fontSize: '16px', borderRadius: '5px', cursor: 'pointer' }} 
            onClick={handleDownload}
          >
            Descargar Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryQR;
