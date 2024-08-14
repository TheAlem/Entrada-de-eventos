const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const os = require("os");
const functions = require("firebase-functions");

// Configuración de Nodemailer para enviar correos
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

/**
 * Envía un correo electrónico con un archivo PDF adjunto.
 * @param {string} email - La dirección de correo electrónico del destinatario.
 * @param {Buffer} pdfData - Los datos del archivo PDF generado.
 * @param {Object} data - Los datos del cliente para personalizar el contenido del correo electrónico.
 */
function sendMail(email, pdfData, data) {
  const mailOptions = {
    from: "boliviablockchainsummit@gmail.com",
    to: email,
    subject: "Tu entrada para el Blockchain Summit",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #42A5F5;">BOLIVIA BLOCKCHAIN SUMMIT</h2>
        <p>Querido(a) ${data.firstName},</p>
        <p>Gracias por registrarte en el Bolivia Blockchain Summit 2024.
          Adjunta encontrarás tu entrada en formato PDF.</p>
        <p><strong>Detalles del evento:</strong></p>
        <ul>
          <li><strong>Fecha:</strong> 20 AGO 2024</li>
          <li><strong>Hora:</strong> 08:00 AM</li>
          <li><strong>Ubicación:</strong> Santa Cruz de la Sierra</li>
        </ul>
        <p>Esperamos verte allí!</p>
        <p>Saludos cordiales,</p>
        <p>Equipo de Bolivia Blockchain Summit</p>
      </div>
    `,
    attachments: [{
      filename: "EntradaBlockchainSummit.pdf",
      content: pdfData,
      contentType: "application/pdf",
    }],
  };

  console.log(`Enviando correo a: ${email}`); // Log para ver a qué correo se envía

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
}

/**
 * Función de Firebase que se activa al actualizar un documento en la colección "clientes".
 * Envía un correo electrónico con un archivo PDF cuando el estado de pago se convierte en verdadero.
 */
exports.sendEmail = functions.firestore.document("clientes/{clientId}")
    .onUpdate(async (change, context) => {
      const data = change.after.data();
      const previousData = change.before.data();

      // Solo enviar el correo si el estado de pago ha cambiado a verdadero
      if (data.paymentStatus && !previousData.paymentStatus) {
        const pdfPath = path.join(os.tmpdir(), `${data.token}.pdf`);
        const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(stream);

        try {
          // Simplificar los datos que se codifican en el código QR
          const qrData = {
            token: data.token,
            event: "Bolivia Blockchain Summit 2024",
            email: data.email,
          };

          // Generar el código QR con los datos simplificados
          const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

          // Contenido del PDF
          pdfDoc.fillColor("#42A5F5")
              .font("Helvetica-Bold")
              .fontSize(30)
              .text("BOLIVIA BLOCKCHAIN SUMMIT 2024", { align: "center" })
              .moveDown(1);

          pdfDoc.fontSize(20)
              .text(data.academicLevel === "Student" ? "Entrada Estudiante" : "Entrada Profesional",
                  { align: "center" })
              .moveDown(0.5);

          pdfDoc.strokeColor("#aaaaaa")
              .lineWidth(1)
              .moveTo(50, pdfDoc.y)
              .lineTo(550, pdfDoc.y)
              .stroke()
              .moveDown(1);

          pdfDoc.fontSize(16)
              .fillColor("#000000")
              .text(`Nombre: ${data.firstName} ${data.lastName}`)
              .text(`Email: ${data.email}`)
              .text(`Teléfono: ${data.phone}`);

          if (data.academicLevel === "Student") {
            pdfDoc.text(`Universidad: ${data.universityName}`);
          } else {
            pdfDoc.text(`Profesión: ${data.profession}`);
          }

          pdfDoc.moveDown(1);

          pdfDoc.fontSize(18)
              .fillColor("#0D47A1")
              .text("Fecha: 20 AGO 2024", { align: "center" })
              .text("Hora: 08:00 AM", { align: "center" })
              .moveDown(0.5);

          pdfDoc.fillColor("#23a03c")
              .text("Ubicación: Santa Cruz de la Sierra", { align: "center" })
              .moveDown(2);

          pdfDoc.image(qrCodeDataURL, { fit: [150, 150], align: "center", valign: "center" });

          pdfDoc.moveDown(3);
          pdfDoc.fontSize(12)
              .fillColor("#aaaaaa")
              .text("Este ticket es personal e intransferible.", { align: "center" });

          pdfDoc.end();

          // Esperar a que el PDF termine de generarse
          await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
          });

          const pdfData = fs.readFileSync(pdfPath);
          sendMail(data.email, pdfData, data);

          // Limpiar el archivo temporal
          fs.unlinkSync(pdfPath);
        } catch (error) {
          console.error("Error generando el PDF o enviando el correo:", error);
        }
      } else {
        console.log("El pago no se ha completado o no se ha actualizado. No se envía correo.");
      }
    });
