import { db, storage } from '../firebase-config';
import { collection, addDoc, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
        await addDoc(collection(db, 'clientes'), {
            ...formData,
            studentId: studentIdUrl,
            timestamp: new Date(),
            status: 'pending', // Inicializa el estado como pendiente
            paymentStatus: false // Inicializa el estado de pago como no pagado
        });
        return { success: true };
    } catch (error) {
        console.error("Error al guardar los datos: ", error);
        return { success: false, error };
    }
};

// Función para escuchar cambios en Firestore en tiempo real
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

// Función para actualizar el estado del ticket
const updateTicketStatus = async (ticketId, status) => {
    try {
        const ticketRef = doc(db, 'clientes', ticketId);
        await updateDoc(ticketRef, { status });
    } catch (error) {
        console.error("Error al actualizar el estado del ticket: ", error);
    }
};

// Función para actualizar el estado de pago del ticket
const updatePaymentStatus = async (ticketId, paymentStatus) => {
    try {
        const ticketRef = doc(db, 'clientes', ticketId);
        await updateDoc(ticketRef, { paymentStatus });
    } catch (error) {
        console.error("Error al actualizar el estado de pago del ticket: ", error);
    }
};

export { saveDataToFirestore, listenToFirestoreUpdates, updateTicketStatus, updatePaymentStatus };
