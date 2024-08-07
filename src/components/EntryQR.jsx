import React, { useEffect, useState } from 'react';
import { db } from '../Firebase/firebase-config';
import { query, where, collection, getDocs, updateDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';

const EntryQR = ({ token }) => {
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      const q = query(collection(db, 'clientes'), where("token", "==", token));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setEntry(doc.data());
        });
      } else {
        console.log("No such document!");
      }
    };
    fetchEntry();
  }, [token]);

  const handleScan = async () => {
    const q = query(collection(db, 'clientes'), where("token", "==", token));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { scanned: true });
    });
  };

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', color: 'white', background: `linear-gradient(to right, ${colors.gradientStart}, ${colors.gradientEnd})` }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>BOLIVIA BLOCKCHAIN SUMMIT</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px' }}>
            <p>2024</p>
            <span style={{ backgroundColor: 'white', color: colors.textColor, fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '999px' }}>
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
            <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.10)' }} onClick={handleScan}>
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
          </div>
          
          <p style={{ fontSize: '12px', textAlign: 'center', color: '#9CA3AF', marginTop: '16px' }}>Un evento del Grupo CECAL SRL y la revista ENERGÍABolivia</p>
        </div>
      </div>
    </div>
  );
};

export default EntryQR;
