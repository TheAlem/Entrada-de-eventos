import $ from 'jquery';
import qs from 'qs';
import { getNextPaymentNumber } from './pagos';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase-config'; // Importa la configuración de Firebase

// Función para generar el código QR con PagoFacil
export const generateQRCode = async (clientToken, setQRImage, callbacks) => {
  try {
    // Consultar la información del cliente en Firestore
    const clientsQuery = query(collection(db, 'clientes'), where('token', '==', clientToken));
    const clientsSnapshot = await getDocs(clientsQuery);

    if (clientsSnapshot.empty) {
      callbacks.onError('No se encontró el cliente en la base de datos.');
      return;
    }

    // Obtener los datos del cliente
    const clientData = clientsSnapshot.docs[0].data();
    const paymentAmount = clientData.academicLevel === 'Student' ? 100 : 200; // 100 BOB para estudiantes, 200 BOB para profesionales

    // Obtener el próximo número de pago
    const paymentNumber = await getNextPaymentNumber();

    // Datos para la solicitud de generación de QR
    const postData = {
      tcCommerceID: "d029fa3a95e174a19934857f535eb9427d967218a36ea014b70ad704bc6c8d1c",
      tnMoneda: "1", // Moneda: 1 para BOB
      tnTelefono: clientData.phone || "777777",
      tcCorreo: clientData.email,
      tcNombreUsuario: `${clientData.firstName} ${clientData.lastName}`,
      tnCiNit: clientData.ci || "123465",
      tcNroPago: paymentNumber,
      tnMontoClienteEmpresa: 0.01,
      tcUrlCallBack: "https://tu-callback-url.com/callback",
      tcUrlReturn: "",
      taPedidoDetalle: [
        {
          Serial: 1,
          Producto: "Entrada Evento",
          Cantidad: 1,
          Precio: paymentAmount,
          Descuento: 0,
          Total: paymentAmount
        }
      ]
    };

    // Headers para la solicitud de PagoFacil
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'TokenSecret': '9E7BC239DDC04F83B49FFDA5',
        'TokenService': '51247fae280c20410824977b0781453df59fad5b23bf2a0d14e884482f91e09078dbe5966e0b970ba696ec4caf9aa5661802935f86717c481f1670e63f35d5041c31d7cc6124be82afedc4fe926b806755efe678917468e31593a5f427c79cdf016b686fca0cb58eb145cf524f62088b57c6987b3bb3f30c2082b640d7c52907',
        'CommerceId': 'd029fa3a95e174a19934857f535eb9427d967218a36ea014b70ad704bc6c8d1c',
    };

    // Llamada a la API de PagoFacil para generar el QR
    const data = await $.ajax({
      url: 'https://serviciostigomoney.pagofacil.com.bo/api/servicio/generarqrv2',
      method: 'POST',
      headers: headers,
      data: qs.stringify(postData),
    });

    // Verificar la respuesta de PagoFacil
    if (data && data.values) {
      const parts = data.values.split(';');
      if (parts.length > 1) {
        const qrBase64 = JSON.parse(parts[1]).qrImage;
        setQRImage(`data:image/png;base64,${qrBase64}`);
        callbacks.onSuccess('Código QR generado con éxito');
      } else {
        callbacks.onError('QR base64 no encontrado en la respuesta.');
      }
    } else {
      callbacks.onError('La respuesta del servidor no contiene "values" o es incorrecta.');
    }
  } catch (error) {
    callbacks.onError('Error al generar el código QR: ' + error.message);
  }
};
