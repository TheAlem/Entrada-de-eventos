import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../Firebase/firebase-config';
import { query, where, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';

const EntryQR = () => {
  const { token } = useParams(); // Retrieve the token directly from URL parameters
  const [entry, setEntry] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(true); // State to track if the payment was made

  useEffect(() => {
    const fetchEntry = async () => {
      const q = query(collection(db, 'clientes'), where("token", "==", token));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const entryData = doc.data();
          if (entryData.paymentStatus) {
            setEntry(entryData);
            triggerSendEmail(entryData); // Trigger the email send function
          } else {
            setHasPaid(false);
          }
        });
      } else {
        console.log("No se encontró ningún documento con el token proporcionado.");
      }
    };
    fetchEntry();
  }, [token]);

  const triggerSendEmail = async (entryData) => {
    try {
      const docRef = doc(db, 'clientes', entryData.token);
      await setDoc(docRef, entryData, { merge: true }); // Merge update the document to trigger the function.
    } catch (error) {
      console.error('Error triggering email:', error);
    }
  };

  const handleDownload = async () => {
    if (downloadCount < 2) {
      const element = document.querySelector("#ticketContainer");
      await new Promise(r => setTimeout(r, 500)); // Wait to ensure styles are applied
      html2canvas(element, {
        scale: 4,
        useCORS: true
      }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `Ticket-${entry.firstName}-${entry.lastName}.png`;
        link.click();
        setDownloadCount(downloadCount + 1);
      });
    } else {
      alert("El límite de descargas ha sido alcanzado.");
    }
  };

  if (!hasPaid) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#ffebee', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', color: '#d32f2f', marginBottom: '16px' }}>No ha realizado el pago</h2>
          <p style={{ fontSize: '16px', color: '#c62828' }}>Por favor, complete el pago para poder acceder a su ticket.</p>
        </div>
      </div>
    );
  }

  if (!entry) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;

  const getColorStyles = (academicLevel) => {
    return academicLevel === "Student" ? {
      gradientStart: '#6cdb78', // Light green
      gradientEnd: '#21da35',   // Medium green
      textColor: '#23a03c',     // Dark green
      highlightColor: '#e4fbe8' // Highlight green
    } : {
      gradientStart: '#98d6f3', // Light blue
      gradientEnd: '#42A5F5',   // Medium blue
      textColor: '#0D47A1',     // Dark blue
      highlightColor: '#E3F2FD' // Highlight blue
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
          <button style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', fontSize: '16px', borderRadius: '5px', cursor: 'pointer' }} onClick={handleDownload}>
            Descargar Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryQR;
