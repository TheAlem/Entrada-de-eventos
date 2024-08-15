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

function sendMail(email, pdfData, data) {
  const mailOptions = {
    from: "boliviablockchainsummit@gmail.com",
    to: email,
    subject: "Tu entrada para el Bolivia Blockchain Summit 2024",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bolivia Blockchain Summit 2024</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="background-color: #42A5F5; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">BOLIVIA BLOCKCHAIN SUMMIT 2024</h1>
        </header>
        <main style="padding: 20px;">
          <p style="font-size: 18px;">Estimado/a <strong>${data.firstName},</strong></p>
          <p>Gracias por registrarte en el Bolivia Blockchain Summit 2024. Adjunta encontrarás tu entrada en formato PDF.</p>
          <div style="background-color: #f0f0f0; border-left: 4px solid #42A5F5; padding: 15px; margin: 20px 0;">
            <h2 style="color: #42A5F5; margin-top: 0;">Detalles del evento:</h2>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Fecha:</strong> 20 AGO 2024</li>
              <li><strong>Hora:</strong> 08:00 AM</li>
              <li><strong>Ubicación:</strong> Santa Cruz de la Sierra</li>
            </ul>
          </div>
          <p>No olvides llevar tu entrada impresa o en tu dispositivo móvil el día del evento.</p>
          <p>¡Esperamos verte allí!</p>
        </main>
        <footer style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">Saludos cordiales,</p>
          <p style="margin: 5px 0;"><strong>Equipo de Bolivia Blockchain Summit</strong></p>
        </footer>
      </body>
      </html>
    `,
    attachments: [{
      filename: "EntradaBoliviaBlockchainSummit2024.pdf",
      content: pdfData,
      contentType: "application/pdf",
    }],
  };

  console.log(`Enviando correo a: ${email}`);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
}

exports.sendEmail = functions.firestore.document("clientes/{clientId}")
    .onUpdate(async (change, context) => {
      const data = change.after.data();
      const previousData = change.before.data();

      if (data.paymentStatus && !previousData.paymentStatus) {
        const pdfPath = path.join(os.tmpdir(), `${data.token}.pdf`);
        const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(stream);

        try {
          const qrData = {
            token: data.token,
            event: "Bolivia Blockchain Summit 2024",
            email: data.email,
          };

          const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

          // Fondo y diseño del PDF
          pdfDoc.rect(0, 0, pdfDoc.page.width, pdfDoc.page.height).fill("#f0f0f0");
          pdfDoc.rect(0, 0, pdfDoc.page.width, 150).fill("#42A5F5");

          // Título del evento
          pdfDoc.fillColor("#FFFFFF")
              .font("Helvetica-Bold")
              .fontSize(32)
              .text("BOLIVIA BLOCKCHAIN SUMMIT 2024", 50, 50, { width: 500, align: "center" })
              .moveDown(0.5);

          // Tipo de entrada
          pdfDoc.fontSize(24)
              .text(data.academicLevel === "Student" ? "Entrada Estudiante" : "Entrada Profesional",
                  { align: "center" })
              .moveDown(1);

          // Información del asistente
          pdfDoc.fillColor("#333333")
              .font("Helvetica")
              .fontSize(16)
              .text(`Nombre: ${data.firstName} ${data.lastName}`, 50, 180)
              .text(`Email: ${data.email}`)
              .text(`Teléfono: ${data.phone}`);

          pdfDoc.moveDown(1);

          // Detalles del evento
          pdfDoc.font("Helvetica-Bold")
              .fontSize(18)
              .fillColor("#0D47A1")
              .text("Detalles del Evento:", 50, 300)
              .moveDown(0.5);

          pdfDoc.font("Helvetica")
              .fontSize(16)
              .text("Fecha: 20 AGO 2024")
              .text("Hora: 08:00 AM")
              .text("Ubicación: Santa Cruz de la Sierra")
              .moveDown(1);

          // Código QR
          pdfDoc.rect(350, 180, 190, 190).fill("#FFFFFF").stroke();
          pdfDoc.image(qrCodeDataURL, 360, 190, { fit: [170, 170] });

          // Número de ticket
          pdfDoc.fontSize(14)
              .fillColor("#333333")
              .text(`Número de Ticket: ${data.token}`, 350, 380, { width: 190, align: "center" });

          // Nota de pie
          pdfDoc.fontSize(10)
              .fillColor("#666666")
              .text("Este ticket es personal e intransferible.", 50, 500, { align: "center" });

          // Línea de corte
          pdfDoc.moveTo(50, 520)
              .lineTo(550, 520)
              .dash(5, { space: 5 })
              .stroke();

          pdfDoc.end();

          await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
          });

          const pdfData = fs.readFileSync(pdfPath);
          sendMail(data.email, pdfData, data);

          fs.unlinkSync(pdfPath);
        } catch (error) {
          console.error("Error generando el PDF o enviando el correo:", error);
        }
      } else {
        console.log("El pago no se ha completado o no se ha actualizado. No se envía correo.");
      }
    });
