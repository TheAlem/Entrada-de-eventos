const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const os = require("os");
const functions = require("firebase-functions");
const { admin, db } = require("../firebaseAdmin");

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
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          header {
            background-color: #183c33;
            padding: 20px;
            text-align: center;
            color: white;
          }
          header h1 {
            margin: 0;
            font-size: 24px;
          }
          main {
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .event-details {
            background-color: #e0f0ed;
            border-left: 4px solid #183c33;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .event-details h2 {
            color: #183c33;
            margin-top: 0;
            font-size: 18px;
          }
          .event-details ul {
            list-style-type: none;
            padding-left: 0;
            margin: 0;
          }
          .event-details ul li {
            margin-bottom: 8px;
          }
          footer {
            background-color: #f4f4f4;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>BOLIVIA BLOCKCHAIN SUMMIT 2024</h1>
        </header>
        <main>
          <p style="font-size: 18px;">Estimado/a <strong>${data.firstName},</strong></p>
          <p>Gracias por registrarte en el Bolivia Blockchain Summit 2024. Adjunta encontrarás tu entrada en formato PDF.</p>
          <div class="event-details">
            <h2>Detalles del evento:</h2>
            <ul>
              <li><strong>Fecha:</strong> 20 AGO 2024</li>
              <li><strong>Hora:</strong> 11:00 AM</li>
              <li><strong>Ubicación:</strong> Santa Cruz de la Sierra</li>
            </ul>
          </div>
          <p>No olvides llevar tu entrada impresa o en tu dispositivo móvil el día del evento.</p>
          <p>¡Esperamos verte allí!</p>
        </main>
        <footer>
          <p>Saludos cordiales,</p>
          <p><strong>Equipo de Bolivia Blockchain Summit</strong></p>
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
        const clientId = context.params.clientId;
        const clientRef = db.collection("clientes").doc(clientId);

        const lastEmailSent = data.lastEmailSent ? data.lastEmailSent.toDate() : null;
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000)); // Hace una hora

        if (lastEmailSent && lastEmailSent > oneHourAgo) {
          console.log("Correo ya enviado hace menos de una hora. No se envía nuevamente.");
          return null;
        }

        const pdfPath = path.join(os.tmpdir(), `${data.token}.pdf`);
        const pdfDoc = new PDFDocument({ size: [792, 612], margin: 0 }); // Tamaño carta en puntos
        const stream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(stream);

        try {
          const qrData = {
            token: data.token,
            event: "Bolivia Blockchain Summit 2024",
            email: data.email,
          };

          const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

          // Imagen de fondo
          pdfDoc.image(path.join(__dirname, "../assets/E-ticket.png"), {
            fit: [pdfDoc.page.width, pdfDoc.page.height],
            align: "center",
            valign: "center",
          });

          // Información del asistente
          pdfDoc.fillColor("#0D47A1")
              .font("Helvetica-Bold")
              .fontSize(16)
              .text(`${data.firstName} ${data.lastName}`, 40, 250, { align: "left" });

          pdfDoc.font("Helvetica")
              .fontSize(12)
              .fillColor("#000000")
              .text(`Email: ${data.email}`, 40, 270, { align: "left" })
              .moveDown(0.5)
              .text(`Teléfono: ${data.phone}`, { align: "left" })
              .moveDown(0.5)
              .text(`Profesión: ${data.profession || "N/A"}`, { align: "left" });

          // Fecha y hora del evento
          pdfDoc.font("Helvetica-Bold")
              .fontSize(16)
              .fillColor("#0D47A1")
              .text("20 AGO 2024 | 11:00 AM", 40, 350, { align: "left" })
              .moveDown(0.2)
              .text("Santa Cruz de la Sierra", { align: "left" });

          // Código QR
          pdfDoc.image(qrCodeDataURL, 500, 270, { fit: [200, 200] });

          pdfDoc.end();

          await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
          });

          const pdfData = fs.readFileSync(pdfPath);
          sendMail(data.email, pdfData, data);

          fs.unlinkSync(pdfPath);

          // Registrar la hora de envío del correo
          await clientRef.update({
            lastEmailSent: admin.firestore.Timestamp.now(),
          });
        } catch (error) {
          console.error("Error generando el PDF o enviando el correo:", error);
        }
      } else {
        console.log("El pago no se ha completado o no se ha actualizado. No se envía correo.");
      }
    });
