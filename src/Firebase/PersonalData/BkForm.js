import { db, storage } from '../firebase-config';
import { collection, addDoc, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import QRCode from 'qrcode';

// Función para guardar datos en Firestore
const saveDataToFirestore = async (formData) => {
    try {
        // Subir imagen del carnet de estudiante si existe
        let studentIdUrl = '';
        if (formData.studentId) {
            const storageRef = ref(storage, `studentIds/${formData.studentId.name}`);
            const snapshot = await uploadBytes(storageRef, formData.studentId);
            studentIdUrl = await getDownloadURL(snapshot.ref);
        }

        // Guardar datos en Firestore
        const docRef = await addDoc(collection(db, 'clientes'), {
            ...formData,
            studentId: studentIdUrl,
            timestamp: new Date(),
            status: 'pending', // Inicializa el estado como pendiente
            paymentStatus: false, // Inicializa el estado de pago como no pagado
            scanned: false // Inicializa el estado de escaneo como no escaneado
        });

        // Generar QR code con los datos relevantes
        const qrData = JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            academicLevel: formData.academicLevel,
            universityName: formData.universityName || "",
            profession: formData.profession || "",
            companyName: formData.companyName || "",
            token: formData.token || "",
            paymentStatus: formData.paymentStatus || false,
            id: docRef.id
        });
        const qrCode = await QRCode.toDataURL(qrData);

        // Actualizar documento con el QR code
        await updateDoc(docRef, { qrCode });

        return { success: true };
    } catch (error) {
        console.error("Error al guardar los datos: ", error);
        return { success: false, error };
    }
};

// Otras funciones para Firestore...
const listenToFirestoreUpdates = (callback) => {
    const q = query(collection(db, 'clientes'));
    onSnapshot(q, (querySnapshot) => {
        const clientes = [];
        querySnapshot.forEach((doc) => {
            clientes.push({ id: doc.id, ...doc.data() });
        });
        callback(clientes);
    });
};

const updateTicketStatus = async (ticketId, status) => {
    try {
        const ticketRef = doc(db, 'clientes', ticketId);
        await updateDoc(ticketRef, { status });
    } catch (error) {
        console.error("Error al actualizar el estado del ticket: ", error);
    }
};

const updatePaymentStatus = async (ticketId, paymentStatus) => {
    try {
        const ticketRef = doc(db, 'clientes', ticketId);
        await updateDoc(ticketRef, { paymentStatus });
    } catch (error) {
        console.error("Error al actualizar el estado de pago del ticket: ", error);
    }
};

/**
 * Actualiza los datos de un documento específico en la colección de clientes.
 * 
 * @param {string} docId - El ID del documento a actualizar.
 * @param {Object} newData - Un objeto con los nuevos datos para actualizar en el documento.
 * @returns {Promise<{success: boolean, error?: Error}>} - Un objeto indicando el resultado de la operación.
 */
const updateDocument = async (docId, newData) => {
    try {
        const documentRef = doc(db, 'clientes', docId);
        await updateDoc(documentRef, newData);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar el documento: ", error);
        return { success: false, error };
    }
};

/**
 * Marks a ticket's payment as completed or not in the Firestore database.
 * 
 * @param {string} ticketId - The ID of the ticket to update.
 * @param {boolean} hasPaid - The payment status to set.
 * @returns {Promise<{success: boolean, error?: Error}>} - The result of the update operation.
 */
const markPaymentAsCompleted = async (ticketId, hasPaid) => {
    try {
        const ticketRef = doc(db, 'clientes', ticketId);
        await updateDoc(ticketRef, { paymentStatus: hasPaid });
        return { success: true };
    } catch (error) {
        console.error("Error updating payment status: ", error);
        return { success: false, error };
    }
};

export { saveDataToFirestore, listenToFirestoreUpdates, updateTicketStatus, updatePaymentStatus, updateDocument, markPaymentAsCompleted };
