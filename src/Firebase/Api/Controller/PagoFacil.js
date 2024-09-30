import $, { post } from 'jquery';
import qs from 'qs';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config.js'; // Importa la configuración de Firebase
import { getNextPaymentNumber } from './pagos'; // Importa tu función de generación de PedidoID

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
    const clientDoc = clientsSnapshot.docs[0];
    const clientData = clientDoc.data();
    const clientId = clientDoc.id; // Obtener el ID del documento
    const paymentAmount = clientData.academicLevel === 'Student' ? 100 : 200; // 100 BOB para estudiantes, 200 BOB para profesionales

    // Generar un nuevo PedidoID
    const PedidoID = await getNextPaymentNumber();  // Siempre generar un nuevo PedidoID

    // Datos para la solicitud de generación de QR
    const postData = {
      tcCommerceID: "d029fa3a95e174a19934857f535eb9427d967218a36ea014b70ad704bc6c8d1c",
      tnMoneda: "1", 
      tnTelefono: clientData.phone || "777777",
      tcCorreo: clientData.email,
      tcNombreUsuario: `${clientData.firstName} ${clientData.lastName}`,
      tnCiNit: clientData.ci || "12345678",
      tcNroPago: PedidoID, // Usar el nuevo PedidoID generado
      tnMontoClienteEmpresa: 0.01,
      tcUrlCallBack: "https://us-central1-transachain.cloudfunctions.net/paymentCallback",
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

        // Usar el método `doc` para obtener la referencia del documento por su ID
        const clientRef = doc(db, 'clientes', clientId);

        // Actualizar Firestore con el nuevo PedidoID y el QR generado
        await updateDoc(clientRef, {
          PedidoID,  // Guardar el nuevo PedidoID en Firestore
          qrCode: `data:image/png;base64,${qrBase64}` // Guardar el QR generado
        });

        callbacks.onSuccess(PedidoID, `data:image/png;base64,${qrBase64}`);
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