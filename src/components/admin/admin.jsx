// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { listenToFirestoreUpdates, updateTicketStatus } from '../../Firebase/PersonalData/BkForm';
import 'tailwindcss/tailwind.css';
import { FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';


function AdminDashboard() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [currentUserTicket, setCurrentUserTicket] = useState(null);

    useEffect(() => {
        listenToFirestoreUpdates(setTickets);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            const userTicket = tickets.find(ticket => ticket.token === userToken);
            if (userTicket) {
                setCurrentUserTicket(userTicket);
            }
        }
    }, [tickets]);

    const goToQRScanner = () => {
        navigate('/EscaneoQR');
    };

    const handleApprove = async (ticketId) => {
        await updateTicketStatus(ticketId, 'approved');
        setTickets(prevTickets => prevTickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, status: 'approved' } : ticket
        ));
    };

    const handleReject = async (ticketId) => {
        await updateTicketStatus(ticketId, 'rejected');
        setTickets(prevTickets => prevTickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, status: 'rejected' } : ticket
        ));
    };

    const studentTickets = tickets.filter(ticket => ticket.academicLevel === 'Student');
    const professionalTickets = tickets.filter(ticket => ticket.academicLevel === 'Professional');

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-16">
            <div className="w-full max-w-4xl space-y-8 p-4">
            <button
                onClick={goToQRScanner}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg">
                Escanear QR
            </button>
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
                                        onClick={() => handleApprove(ticket.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                        disabled={ticket.status === 'approved' || ticket.status === 'rejected'}
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleReject(ticket.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                        disabled={ticket.status === 'approved' || ticket.status === 'rejected'}
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
                                <div className="mt-4">
                                    <p><strong>Estado del Pago:</strong> {ticket.paymentStatus ? 'Pagado' : 'No Pagado'}</p>
                                    <p><strong>Estado:</strong> {ticket.status === 'approved' ? 'Aprobado' : ticket.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {currentUserTicket && (
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold mb-4">Mis Datos</h3>
                        <div className="mb-2 bg-white p-4 rounded-lg shadow">
                            <p><strong>Nombre:</strong> {currentUserTicket.firstName} {currentUserTicket.lastName}</p>
                            <p><strong>Correo Electrónico:</strong> {currentUserTicket.email}</p>
                            <p><strong>Nivel Académico:</strong> {currentUserTicket.academicLevel}</p>
                            {currentUserTicket.academicLevel === 'Student' && <p><strong>Universidad:</strong> {currentUserTicket.universityName}</p>}
                            {currentUserTicket.academicLevel === 'Professional' && <p><strong>Profesión:</strong> {currentUserTicket.profession}</p>}
                            <p><strong>Estado del Pago:</strong> {currentUserTicket.paymentStatus ? 'Pagado' : 'No Pagado'}</p>
                            <p><strong>Estado:</strong> {currentUserTicket.status === 'approved' ? 'Aprobado' : currentUserTicket.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
