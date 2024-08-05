const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu_correo@gmail.com',
    pass: 'tu_contraseña'
  }
});

exports.generateAndSendPDF = functions.firestore.document('clientes/{clientId}').onCreate(async (snap, context) => {
  const data = snap.data();
  const doc = new PDFDocument();
  const buffers = [];
  
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    sendMail(data.email, pdfData);
  });

  // Encabezado
  doc.fillColor('#42A5F5').fontSize(25).font('Helvetica-Bold').text('BOLIVIA BLOCKCHAIN SUMMIT', { align: 'center' });
  doc.moveDown(0.5);

  // Detalles del evento
  doc.fillColor('#0D47A1').fontSize(18).text('2024', { continued: true, align: 'right' });
  doc.fillColor('#23a03c').text(data.academicLevel === "Student" ? 'Entrada Estudiante' : 'Entrada Profesional', { align: 'left' });
  doc.moveDown(0.5);

  // Información personal
  doc.fillColor('#000').fontSize(16).text(`${data.firstName} ${data.lastName}`, { align: 'center' });
  doc.fontSize(14).text(`Email: ${data.email}`, { align: 'center' });
  doc.text(`Teléfono: ${data.phone}`, { align: 'center' });
  
  if (data.academicLevel === "Student") {
    doc.text(`Universidad: ${data.universityName}`, { align: 'center' });
  } else {
    doc.text(`Profesión: ${data.profession}`, { align: 'center' });
  }

  // Fecha y ubicación
  doc.moveDown(1);
  doc.fillColor('#9CA3AF').fontSize(18).text('20 AGO 2024 | 11:00 AM', { align: 'center' });
  doc.text('Santa Cruz de la Sierra', { align: 'center' });

  doc.end();

  function sendMail(email, pdfData) {
    const mailOptions = {
      from: 'tu_correo@gmail.com',
      to: email,
      subject: 'Tu entrada para el Blockchain Summit',
      text: 'Aquí está tu entrada para el evento en formato PDF.',
      attachments: [{
        filename: 'EntradaBlockchainSummit.pdf',
        content: pdfData,
        contentType: 'application/pdf'
      }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
});
