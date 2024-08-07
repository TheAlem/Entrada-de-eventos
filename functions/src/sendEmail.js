const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "boliviablockchainsummit@lukaindustries.com",
    pass: "Adminblockchain2024$$",
  },
});

/**
 * Generates and sends a PDF ticket when a new client is created.
 * @param {Object} snap - The snapshot of the newly created document.
 * @param {Object} context - The event context.
 */
module.exports = functions.firestore.document("clientes/{clientId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        sendMail(data.email, pdfData);
      });

      // Generar QR Code
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        academicLevel: data.academicLevel,
        universityName: data.universityName || "",
        profession: data.profession || "",
        companyName: data.companyName || "",
        token: data.token,
        paymentStatus: data.paymentStatus,
      }));

      // Encabezado
      doc.fillColor("#42A5F5").fontSize(25).font("Helvetica-Bold")
          .text("BOLIVIA BLOCKCHAIN SUMMIT", { align: "center" });
      doc.moveDown(0.5);

      // Detalles del evento
      doc.fillColor("#0D47A1").fontSize(18).text("2024", { continued: true, align: "right" });
      doc.fillColor("#23a03c").text(
      data.academicLevel === "Student" ? "Entrada Estudiante" : "Entrada Profesional",
      { align: "left" },
      );
      doc.moveDown(0.5);

      // Información personal
      doc.fillColor("#000").fontSize(16).text(`${data.firstName} ${data.lastName}`, { align: "center" });
      doc.fontSize(14).text(`Email: ${data.email}`, { align: "center" });
      doc.text(`Teléfono: ${data.phone}`, { align: "center" });

      if (data.academicLevel === "Student") {
        doc.text(`Universidad: ${data.universityName}`, { align: "center" });
      } else {
        doc.text(`Profesión: ${data.profession}`, { align: "center" });
      }

      // Fecha y ubicación
      doc.moveDown(1);
      doc.fillColor("#9CA3AF").fontSize(18)
          .text("20 AGO 2024 | 11:00 AM", { align: "center" });
      doc.text("Santa Cruz de la Sierra", { align: "center" });

      // QR Code
      doc.moveDown(1);
      doc.image(qrCodeDataURL, { fit: [150, 150], align: "center", valign: "center" });

      doc.end();

      /**
     * Sends an email with the generated PDF ticket.
     * @param {string} email - The recipient's email address.
     * @param {Buffer} pdfData - The generated PDF data.
     */
      function sendMail(email, pdfData) {
        const mailOptions = {
          from: "boliviablockchainsummit@lukaindustries.com",
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
            console.log("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
      }
    });
