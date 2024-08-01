import React, { useState, useEffect } from 'react';
import { listenToFirestoreUpdates, updateTicketStatus } from '../../Firebase/PersonalData/BkForm';
import 'tailwindcss/tailwind.css';
import { FiEye } from 'react-icons/fi';

function AdminDashboard() {
    const [tickets, setTickets] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        listenToFirestoreUpdates(setTickets);
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
    }, []);

    const handleApprove = async (ticketId, isStudent) => {
        await updateTicketStatus(ticketId, 'approved');
        if (currentUser && currentUser.id === ticketId) {
            setCurrentUser({ ...currentUser, status: 'approved' });
        }
        alert('Registro aprobado');
    };

    const handleReject = async (ticketId) => {
        await updateTicketStatus(ticketId, 'rejected');
        if (currentUser && currentUser.id === ticketId) {
            setCurrentUser({ ...currentUser, status: 'rejected' });
        }
        alert('Registro rechazado');
    };

    const studentTickets = tickets.filter(ticket => ticket.academicLevel === 'Student');
    const professionalTickets = tickets.filter(ticket => ticket.academicLevel === 'Professional');

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-16">
            <div className="w-full max-w-4xl space-y-8 p-4">
                <div>
                    <h3 className="text-2xl font-bold mb-4">Registros de Estudiantes</h3>
                    <ul>
                        {studentTickets.map(ticket => (
                            <li key={ticket.id} className="mb-2 bg-white p-4 rounded-lg shadow">
                                <p><strong>Nombre:</strong> {ticket.firstName} {ticket.lastName}</p>
                                <p><strong>Correo Electrónico:</strong> {ticket.email}</p>
                                <p><strong>Universidad:</strong> {ticket.universityName}</p>
                                <p><strong>Imagen de Carnet:</strong></p>
                                <div className="flex justify-center">
                                    <img
                                        src={ticket.studentId}
                                        alt="Carnet de Estudiante"
                                        className="w-64 h-80 object-cover rounded-lg mt-2"
                                    />
                                </div>
                                <div className="flex justify-center mt-2">
                                    <a
                                        href={ticket.studentId}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-500 hover:text-blue-700"
                                    >
                                        <FiEye className="mr-2" /> Ver imagen
                                    </a>
                                </div>
                                <div className="flex space-x-4 mt-4">
                                    <button
                                        onClick={() => handleApprove(ticket.id, true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleReject(ticket.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <p><strong>Estado del Pago:</strong> {ticket.paymentStatus ? 'Pagado' : 'No Pagado'}</p>
                                    <p><strong>Estado:</strong> {ticket.status === 'approved' ? 'Aprobado' : ticket.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4">Registros de Profesionales</h3>
                    <ul>
                        {professionalTickets.map(ticket => (
                            <li key={ticket.id} className="mb-2 bg-white p-4 rounded-lg shadow">
                                <p><strong>Nombre:</strong> {ticket.firstName} {ticket.lastName}</p>
                                <p><strong>Correo Electrónico:</strong> {ticket.email}</p>
                                <p><strong>Profesión:</strong> {ticket.profession}</p>
                                <p><strong>Estado del Pago:</strong> {ticket.paymentStatus ? 'Pagado' : 'No Pagado'}</p>
                                <div className="mt-4">
                                    <p><strong>Estado:</strong> {ticket.status === 'approved' ? 'Aprobado' : ticket.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {currentUser && (
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold mb-4">Mis Datos</h3>
                        <div className="mb-2 bg-white p-4 rounded-lg shadow">
                            <p><strong>Nombre:</strong> {currentUser.firstName} {currentUser.lastName}</p>
                            <p><strong>Correo Electrónico:</strong> {currentUser.email}</p>
                            <p><strong>Nivel Académico:</strong> {currentUser.academicLevel}</p>
                            {currentUser.academicLevel === 'Student' && <p><strong>Universidad:</strong> {currentUser.universityName}</p>}
                            {currentUser.academicLevel === 'Professional' && <p><strong>Profesión:</strong> {currentUser.profession}</p>}
                            <p><strong>Estado del Pago:</strong> {currentUser.paymentStatus ? 'Pagado' : 'No Pagado'}</p>
                            <p><strong>Estado:</strong> {currentUser.status === 'approved' ? 'Aprobado' : currentUser.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
