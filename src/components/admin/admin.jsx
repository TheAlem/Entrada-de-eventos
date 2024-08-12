import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listenToFirestoreUpdates, updateTicketStatus, updateDocument, markPaymentAsCompleted } from '../../Firebase/PersonalData/BkForm';
import { FiEdit, FiCheckSquare, FiXSquare, FiDownload, FiDollarSign, FiEye, FiExternalLink } from 'react-icons/fi';
import 'tailwindcss/tailwind.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [editMode, setEditMode] = useState(null);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        listenToFirestoreUpdates(setTickets);
    }, []);

    const handleChange = (id, field, value) => {
        setEditData(prevData => ({
            ...prevData,
            [id]: { ...prevData[id], [field]: value }
        }));
    };

    const handleSave = async (id) => {
        await updateDocument(id, editData[id]);
        setEditMode(null);
    };

    const handleEdit = (ticket) => {
        setEditMode(ticket.id);
        setEditData(prevData => ({
            ...prevData,
            [ticket.id]: ticket
        }));
    };

    const handleApprove = async (ticketId, isStudent) => {
        await updateTicketStatus(ticketId, 'approved');
        setTickets(prevTickets => prevTickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, status: 'approved' } : ticket
        ));
        if (isStudent) {
            alert('Estudiante verificado y aprobado.');
            navigate('/payment');
        }
    };

    const handleReject = async (ticketId, isStudent) => {
        await updateTicketStatus(ticketId, 'rejected');
        setTickets(prevTickets => prevTickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, status: 'rejected' } : ticket
        ));
        if (isStudent) {
            alert('No verificado como estudiante. Por favor, intente de nuevo.');
        }
    };

    const handleMarkPayment = async (ticketId, hasPaid) => {
        await markPaymentAsCompleted(ticketId, hasPaid);
    };

    const studentTickets = tickets.filter(ticket => ticket.academicLevel === 'Student');
    const professionalTickets = tickets.filter(ticket => ticket.academicLevel === 'Professional');

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 pt-16">
            <div className="w-full max-w-5xl p-6">
                <button
                    onClick={() => navigate('/EscaneoQR')}
                    className="mb-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-all duration-300"
                >
                    Escanear QR
                </button>

                <div className="mb-12">
                    <h3 className="text-3xl font-bold text-gray-800 mb-6">Registros de Estudiantes</h3>
                    <ul className="space-y-6">
                        {studentTickets.map(ticket => (
                            <li key={ticket.id} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                                {editMode === ticket.id ? (
                                    <div className="space-y-4">
                                        <div className="flex space-x-4">
                                            <input
                                                type="text"
                                                value={editData[ticket.id].firstName}
                                                onChange={e => handleChange(ticket.id, 'firstName', e.target.value)}
                                                className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                value={editData[ticket.id].lastName}
                                                onChange={e => handleChange(ticket.id, 'lastName', e.target.value)}
                                                className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                value={editData[ticket.id].universityName}
                                                onChange={e => handleChange(ticket.id, 'universityName', e.target.value)}
                                                className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="flex space-x-4">
                                            <button onClick={() => handleSave(ticket.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300">
                                                <FiCheckSquare /> Guardar
                                            </button>
                                            <button onClick={() => setEditMode(null)} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-300">
                                                <FiXSquare /> Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-2">
                                                <p><strong>Nombre:</strong> {ticket.firstName} {ticket.lastName}</p>
                                                <p><strong>Correo Electrónico:</strong> {ticket.email}</p>
                                                <p><strong>Universidad:</strong> {ticket.universityName}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(ticket)}
                                                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-300"
                                                >
                                                    <FiEdit /> Editar
                                                </button>
                                                <button
                                                    onClick={() => handleMarkPayment(ticket.id, !ticket.paymentStatus)}
                                                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                                                >
                                                    <FiDollarSign /> {ticket.paymentStatus ? 'Desmarcar Pago' : 'Marcar como Pagado'}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/entry/${ticket.token}`)}
                                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                                                >
                                                    <FiExternalLink /> Ver Ticket
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <img
                                                src={ticket.studentId}
                                                alt="Carnet de Estudiante"
                                                className="w-64 h-80 object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>
                                        <div className="flex justify-center mt-2">
                                            <a
                                                href={ticket.studentId}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-500 hover:text-indigo-700 transition-all duration-300"
                                            >
                                                <FiEye className="inline-block mr-2" /> Ver imagen
                                            </a>
                                        </div>
                                        <div className="flex justify-between mt-4">
                                            <button
                                                onClick={() => handleApprove(ticket.id, true)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                                                disabled={ticket.status === 'approved' || ticket.status === 'rejected'}
                                            >
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleReject(ticket.id, true)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                                                disabled={ticket.status === 'approved' || ticket.status === 'rejected'}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                        <div className="mt-4">
                                            <p><strong>Estado del Pago:</strong> {ticket.paymentStatus ? 'Pagado' : 'No Pagado'}</p>
                                            <p><strong>Estado:</strong> {ticket.status === 'approved' ? 'Aprobado' : ticket.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</p>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-6">Registros de Profesionales</h3>
                    <ul className="space-y-6">
                        {professionalTickets.map(ticket => (
                            <li key={ticket.id} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                                {editMode === ticket.id ? (
                                    <div className="space-y-4">
                                        <div className="flex space-x-4">
                                            <input
                                                type="text"
                                                value={editData[ticket.id].firstName}
                                                onChange={e => handleChange(ticket.id, 'firstName', e.target.value)}
                                                className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                value={editData[ticket.id].lastName}
                                                onChange={e => handleChange(ticket.id, 'lastName', e.target.value)}
                                                className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={editData[ticket.id].profession}
                                                    onChange={e => handleChange(ticket.id, 'profession', e.target.value)}
                                                    className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="flex space-x-4">
                                                <button onClick={() => handleSave(ticket.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300">
                                                    <FiCheckSquare /> Guardar
                                                </button>
                                                <button onClick={() => setEditMode(null)} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-300">
                                                    <FiXSquare /> Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-2">
                                                    <p><strong>Nombre:</strong> {ticket.firstName} {ticket.lastName}</p>
                                                    <p><strong>Correo Electrónico:</strong> {ticket.email}</p>
                                                    <p><strong>Profesión:</strong> {ticket.profession}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(ticket)}
                                                        className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-300"
                                                    >
                                                        <FiEdit /> Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkPayment(ticket.id, !ticket.paymentStatus)}
                                                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                                                    >
                                                        <FiDollarSign /> {ticket.paymentStatus ? 'Desmarcar Pago' : 'Marcar como Pagado'}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/entry/${ticket.token}`)}
                                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                                                    >
                                                        <FiExternalLink /> Ver Ticket
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <p><strong>Estado del Pago:</strong> {ticket.paymentStatus ? 'Pagado' : 'No Pagado'}</p>
                                                <p><strong>Estado:</strong> {ticket.status === 'approved' ? 'Aprobado' : ticket.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</p>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    
    export default AdminDashboard;
