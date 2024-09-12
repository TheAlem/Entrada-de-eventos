import { db } from '../../firebase-config.js'; // Importa la configuración de Firebase
import { collection, addDoc, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

/**
 * Obtener el próximo número de pago incrementado.
 * @returns {Promise<string>} El siguiente número de pago en formato "TransaChain-X".
 */
export async function getNextPaymentNumber() {
    const counterRef = doc(db, "settings", "paymentCounter");
    const docSnap = await getDoc(counterRef);

    if (!docSnap.exists()) {
        // Crea el documento si no existe con un número inicial
        await setDoc(counterRef, { lastNumber: 11 }); // Inicializa con 11
        return "TransaChain-1";
    }

    let lastNumber = docSnap.data().lastNumber;
    const newNumber = lastNumber + 1;

    // Actualiza el contador en Firestore
    await updateDoc(counterRef, { lastNumber: newNumber });

    return `TransaChain-${newNumber}`;
}

/**
 * Registrar los detalles del pago en Firestore.
 * @param {Object} paymentData Datos del pago.
 * @returns {Promise<string>} ID del documento de pago creado.
 */
export async function recordPaymentDetails(paymentData) {
    try {
        // Añade el documento de pago a la colección 'payments'
        const docRef = await addDoc(collection(db, "payments"), paymentData);
        console.log("Payment record created with ID:", docRef.id);
        return docRef.id; // Retorna el ID del documento de pago para referencia futura
    } catch (error) {
        console.error("Error creating payment record:", error);
        throw error;
    }
}

/**
 * Crear un registro de pago con detalles y número de pago incrementado.
 * @param {Object} paymentDetails Detalles del pago sin incluir el número de pago.
 */
export async function createPaymentRecord(paymentDetails) {
    try {
        const paymentNumber = await getNextPaymentNumber(); // Obtiene el próximo número de pago
        const paymentData = {
            ...paymentDetails,
            paymentNumber, // Añade el número de pago al registro
        };

        const paymentId = await recordPaymentDetails(paymentData);
        console.log(`Payment with number ${paymentNumber} recorded successfully with ID ${paymentId}`);
    } catch (error) {
        console.error("Failed to create payment record:", error);
    }
}



export default {
    createPaymentRecord,
    recordPaymentDetails,
    getNextPaymentNumber
};
