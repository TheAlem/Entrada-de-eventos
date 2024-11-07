import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Firebase/context/AuthContext';
import {
  listenToFirestoreUpdates,
  updateTicketStatus,
  updateDocument,
  markPaymentAsCompleted,
} from '../../Firebase/PersonalData/BkForm';
import {
  FiEdit,
  FiCheck,
  FiX,
  FiDollarSign,
  FiEye,
  FiExternalLink,
  FiLogOut,
  FiDownload,
  FiCamera,
  FiCheckCircle,
  FiXCircle,
  FiUser,  // Aquí importamos el ícono FiUser
  FiBriefcase, // Y también importamos FiBriefcase
} from 'react-icons/fi';
import 'tailwindcss/tailwind.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({});
  const { logout } = useAuth();

  useEffect(() => {
    listenToFirestoreUpdates(setTickets);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleChange = (id, field, value) => {
    setEditData((prevData) => ({
      ...prevData,
      [id]: { ...prevData[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    await updateDocument(id, editData[id]);
    setEditMode(null);
  };

  const handleEdit = (ticket) => {
    setEditMode(ticket.id);
    setEditData((prevData) => ({
      ...prevData,
      [ticket.id]: ticket,
    }));
  };

  const handleApprove = async (ticketId) => {
    await updateTicketStatus(ticketId, 'approved');
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: 'approved' } : ticket
      )
    );
    alert('Estudiante verificado y aprobado.');
  };

  const handleReject = async (ticketId) => {
    await updateTicketStatus(ticketId, 'rejected');
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: 'rejected' } : ticket
      )
    );
    alert('No verificado como estudiante. Por favor, intente de nuevo.');
  };

  const handleMarkPayment = async (ticketId, hasPaid) => {
    await markPaymentAsCompleted(ticketId, hasPaid);
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, paymentStatus: hasPaid } : ticket
      )
    );
  };

  const exportToExcel = async () => {
    // Filtrar los tickets con pago completado
    const purchasedTickets = tickets.filter((ticket) => ticket.paymentStatus);

    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tickets');

    // Añadir encabezados
    worksheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Correo Electrónico', key: 'email', width: 30 },
      { header: 'Nivel Académico', key: 'nivelAcademico', width: 20 },
      { header: 'Universidad/Profesión', key: 'universidadProfesion', width: 30 },
      { header: 'Estado del Pago', key: 'estadoPago', width: 15 },
    ];

    // Añadir filas
    purchasedTickets.forEach((ticket) => {
      worksheet.addRow({
        nombre: `${ticket.firstName} ${ticket.lastName}`,
        email: ticket.email,
        nivelAcademico: ticket.academicLevel,
        universidadProfesion:
          ticket.academicLevel === 'Student' ? ticket.universityName : ticket.profession,
        estadoPago: ticket.paymentStatus ? 'Pagado' : 'No Pagado',
      });
    });

    // Aplicar estilos
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Generar el archivo Excel y descargarlo
    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'tickets.xlsx');
  };

  const studentTickets = tickets.filter(
    (ticket) => ticket.academicLevel === 'Student'
  );
  const professionalTickets = tickets.filter(
    (ticket) => ticket.academicLevel === 'Professional'
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegación */}
      <nav className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <button
                onClick={() => navigate('/EscaneoQR')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                <FiCamera className="mr-2" /> Escanear QR
              </button>
              <button
                onClick={exportToExcel}
                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              >
                <FiDownload className="mr-2" /> Exportar a Excel
              </button>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                <FiLogOut className="mr-2" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tickets de Estudiantes */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FiUser className="mr-2" /> Registros de Estudiantes
          </h2>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="text-white" style={{backgroundColor: '#183c33'}} >
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Universidad
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Estado del Pago
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {editMode === ticket.id ? (
                        <input
                          type="text"
                          value={editData[ticket.id]?.firstName}
                          onChange={(e) =>
                            handleChange(
                              ticket.id,
                              'firstName',
                              e.target.value
                            )
                          }
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.firstName} {ticket.lastName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.email}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {editMode === ticket.id ? (
                        <input
                          type="text"
                          value={editData[ticket.id]?.universityName}
                          onChange={(e) =>
                            handleChange(
                              ticket.id,
                              'universityName',
                              e.target.value
                            )
                          }
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {ticket.universityName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {ticket.paymentStatus ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Pagado
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          No Pagado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {ticket.status === 'approved' ? (
                        <FiCheckCircle className="text-green-500 inline-block" size={20} />
                      ) : ticket.status === 'rejected' ? (
                        <FiXCircle className="text-red-500 inline-block" size={20} />
                      ) : (
                        <span className="text-gray-500">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {editMode === ticket.id ? (
                          <>
                            <button
                              onClick={() => handleSave(ticket.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button
                              onClick={() => setEditMode(null)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(ticket)}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <FiEdit size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            handleMarkPayment(
                              ticket.id,
                              !ticket.paymentStatus
                            )
                          }
                          className="text-green-600 hover:text-green-800"
                        >
                          <FiDollarSign size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/entry/${ticket.token}`)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiExternalLink size={18} />
                        </button>
                        {ticket.studentId && (
                          <a
                            href={ticket.studentId}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FiEye size={18} />
                          </a>
                        )}
                        {ticket.status !== 'approved' &&
                          ticket.status !== 'rejected' && (
                            <>
                              <button
                                onClick={() => handleApprove(ticket.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <FiCheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(ticket.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiXCircle size={18} />
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tickets de Profesionales */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <FiBriefcase className="mr-2" /> Registros de Profesionales
          </h2>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className=" text-white" style={{backgroundColor: '#183c33'}}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Profesión
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Estado del Pago
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professionalTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {editMode === ticket.id ? (
                        <input
                          type="text"
                          value={editData[ticket.id]?.firstName}
                          onChange={(e) =>
                            handleChange(
                              ticket.id,
                              'firstName',
                              e.target.value
                            )
                          }
                          id='edit-nombre'
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.firstName} {ticket.lastName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.email}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {editMode === ticket.id ? (
                        <input
                          type="text"
                          value={editData[ticket.id]?.profession}
                          onChange={(e) =>
                            handleChange(
                              ticket.id,
                              'profession',
                              e.target.value
                            )
                          }
                          id='edit-profesion'
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {ticket.profession}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {ticket.paymentStatus ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Pagado
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          No Pagado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {editMode === ticket.id ? (
                          <>
                            <button
                              onClick={() => handleSave(ticket.id)}
                              id='btn-confirmar-edit'
                              className="text-green-600 hover:text-green-800"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button
                              onClick={() => setEditMode(null)}
                              id='btn-cancelar-edit'
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(ticket)}
                              id='btn-edit'
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <FiEdit size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            handleMarkPayment(
                              ticket.id,
                              !ticket.paymentStatus
                            )
                          }
                          id='btn-pago'
                          className="text-green-600 hover:text-green-800"
                        >
                          <FiDollarSign size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/entry/${ticket.token}`)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
