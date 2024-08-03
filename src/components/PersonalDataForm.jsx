import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveDataToFirestore, listenToFirestoreUpdates } from '../Firebase/PersonalData/BkForm';
import 'tailwindcss/tailwind.css';

const PersonalDataForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    country: '',
    academicLevel: '',
    companyName: '',
    universityName: '',
    profession: '',
    email: '',
    phone: '',
    studentId: null
  });
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('userToken') || uuidv4());

  useEffect(() => {
    if (!localStorage.getItem('userToken')) {
      localStorage.setItem('userToken', token);
    }
    const interval = setInterval(() => {
      checkTicketStatus();
    }, 5000); // Verifica el estado del ticket cada 5 segundos

    return () => clearInterval(interval);
  }, [token]);

  const checkTicketStatus = () => {
    listenToFirestoreUpdates((tickets) => {
      const userTicket = tickets.find(ticket => ticket.token === token);
      if (userTicket && userTicket.status === 'approved') {
        window.location.href = `/payment?level=${userTicket.academicLevel}`;
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "studentId") {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataWithToken = { ...formData, token };

    const result = await saveDataToFirestore(formDataWithToken);
    if (result.success) {
      if (formData.academicLevel === 'Student') {
        setMessage('Tus datos están en revisión. Serás redirigido una vez sean aprobados.');
      } else {
        window.location.href = `/payment?level=${formData.academicLevel}`;
      }
    } else {
      alert('Error al enviar los datos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Datos Personales</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
                placeholder="Nombre"
                required
                pattern="[A-Za-z\s]+"
                title="Solo se permiten letras y espacios"
              />
              <label htmlFor="firstName" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Nombre</label>
            </div>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
                placeholder="Apellidos"
                required
                pattern="[A-Za-z\s]+"
                title="Solo se permiten letras y espacios"
              />
              <label htmlFor="lastName" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Apellidos</label>
            </div>
          </div>
          <div className="relative">
            <input
              type="date"
              name="birthDate"
              id="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
              required
              min="1900-01-01"
              max={new Date().toISOString().split("T")[0]}
            />
            <label htmlFor="birthDate" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Fecha de Nacimiento</label>
          </div>
          <div className="relative">
            <select
              name="country"
              id="country"
              value={formData.country}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 bg-transparent pt-4 pb-1"
              required
            >
              <option value="" disabled>Elija una opción</option>
              <option value="Bolivia">Bolivia +591</option>
              <option value="Argentina">Argentina +54</option>
              <option value="Chile">Chile +56</option>
              <option value="Brasil">Brasil +55</option>
              <option value="Colombia">Colombia +57</option>
              <option value="Peru">Perú +51</option>
              <option value="Mexico">México +52</option>
              <option value="United States">Estados Unidos +1</option>
            </select>
            <label htmlFor="country" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">País</label>
          </div>
          <div className="relative">
            <select
              name="academicLevel"
              id="academicLevel"
              value={formData.academicLevel}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 bg-transparent pt-4 pb-1"
              required
            >
              <option value="" disabled>Elija una opción</option>
              <option value="Student">Estudiante Universitario</option>
              <option value="Professional">Profesional</option>
            </select>
            <label htmlFor="academicLevel" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Nivel Académico</label>
          </div>
          {formData.academicLevel === 'Professional' && (
            <>
              <div className="relative">
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
                  placeholder="Nombre de la Empresa"
                  required
                  pattern="[A-Za-z\s]+"
                  title="Solo se permiten letras y espacios"
                />
                <label htmlFor="companyName" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Nombre de la Empresa</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="profession"
                  id="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
                  placeholder="Profesión"
                  required
                  pattern="[A-Za-z\s]+"
                  title="Solo se permiten letras y espacios"
                />
                <label htmlFor="profession" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Profesión</label>
              </div>
            </>
          )}
          {formData.academicLevel === 'Student' && (
            <>
              <div className="relative">
                <input
                  type="text"
                  name="universityName"
                  id="universityName"
                  value={formData.universityName}
                  onChange={handleChange}
                  className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
                  placeholder="Nombre de la Universidad"
                  required
                  pattern="[A-Za-z\s]+"
                  title="Solo se permiten letras y espacios"
                />
                <label htmlFor="universityName" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Nombre de la Universidad</label>
              </div>
              <div className="relative">
                <input
                  type="file"
                  name="studentId"
                  id="studentId"
                  accept="image/*"
                  onChange={handleChange}
                  className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 pt-4 pb-1"
                  required
                />
                <label htmlFor="studentId" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Subir Carnet de Estudiante</label>
              </div>
            </>
          )}
          <div className="relative">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
              placeholder="Correo Electrónico"
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              title="Ingrese un correo electrónico válido"
            />
            <label htmlFor="email" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Correo Electrónico</label>
          </div>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="peer w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent pt-4 pb-1"
              placeholder="Nº de Teléfono/Celular"
              required
              pattern="\d{8,10}"
              title="Debe tener 8 o 10 dígitos"
            />
            <label htmlFor="phone" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Nº de Teléfono/Celular</label>
          </div>
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Enviar
            </button>
          </div>
        </form>
        {message && (
          <div className="mt-8 bg-blue-100 text-blue-800 p-4 rounded-lg">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalDataForm;
