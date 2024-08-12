const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const os = require("os");

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
 * Enviar correo electrónico con el PDF adjunto.
 * @param {string} email - Correo electrónico del destinatario.
 * @param {Buffer} pdfData - El archivo PDF generado.
 * @param {Object} data - Datos del cliente para personalizar el contenido del correo.
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
          <li><strong>Hora:</strong> 11:00 AM</li>
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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
}

/**
 * Genera y envía un PDF con el ticket cuando se crea un nuevo cliente.
 * @param {Object} snap - La instantánea del nuevo documento creado.
 * @param {Object} context - El contexto del evento.
 */
exports.sendEmail = functions.firestore.document("clientes/{clientId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();

      if (data.paymentStatus) {
        const pdfPath = path.join(os.tmpdir(), `${data.token}.pdf`);
        const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(stream);

        // Generación del QR Code
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data));

        // Diseño del Ticket

        // Encabezado
        pdfDoc.fillColor("#42A5F5")
            .font("Helvetica-Bold")
            .fontSize(30)
            .text("BOLIVIA BLOCKCHAIN SUMMIT 2024", { align: "center" })
            .moveDown(1);

        // Subtítulo
        pdfDoc.fontSize(20)
            .text(data.academicLevel === "Student" ? "Entrada Estudiante" : "Entrada Profesional", { align: "center" })
            .moveDown(0.5);

        // Línea divisoria
        pdfDoc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, pdfDoc.y)
            .lineTo(550, pdfDoc.y)
            .stroke()
            .moveDown(1);

        // Información personal
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

        // Fecha y ubicación del evento
        pdfDoc.fontSize(18)
            .fillColor("#0D47A1")
            .text("Fecha: 20 AGO 2024", { align: "center" })
            .text("Hora: 11:00 AM", { align: "center" })
            .moveDown(0.5);

        pdfDoc.fillColor("#23a03c")
            .text("Ubicación: Santa Cruz de la Sierra", { align: "center" })
            .moveDown(2);

        // Inserción del código QR
        pdfDoc.image(qrCodeDataURL, { fit: [150, 150], align: "center", valign: "center" });

        // Pie de página
        pdfDoc.moveDown(3);
        pdfDoc.fontSize(12)
            .fillColor("#aaaaaa")
            .text("Este ticket es personal e intransferible.", { align: "center" });

        pdfDoc.end();

        await new Promise((resolve, reject) => {
          stream.on("finish", resolve);
          stream.on("error", reject);
        });

        const pdfData = fs.readFileSync(pdfPath);
        sendMail(data.email, pdfData, data);

        fs.unlinkSync(pdfPath); // Elimina el archivo temporal después de enviarlo
      } else {
        console.log("El pago no se ha completado. No se envía correo.");
      }
    });
