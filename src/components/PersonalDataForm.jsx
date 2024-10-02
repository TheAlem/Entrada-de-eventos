import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveDataToFirestore } from '../Firebase/PersonalData/BkForm';
import { useToken } from '../Firebase/context/TokenContext';
import ClipLoader from 'react-spinners/ClipLoader';
import 'tailwindcss/tailwind.css';
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
} from 'react-icons/ai';
import { BsBuilding, BsCalendar } from 'react-icons/bs';
import { FaUniversity, FaRegIdBadge } from 'react-icons/fa';

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
    studentId: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { token, updateToken } = useToken();

  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {}, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const generateAndStoreToken = () => {
    const newToken = uuidv4();
    updateToken(newToken);
    return newToken;
  };

  const clearSession = () => {
    updateToken(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'studentId') {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (token) {
      clearSession();
    }

    const userToken = generateAndStoreToken();
    const formDataWithToken = { ...formData, token: userToken };

    try {
      const result = await saveDataToFirestore(formDataWithToken);
      if (result.success) {
        window.location.href = `/payment/${userToken}?level=${formData.academicLevel}`;
      } else {
        setMessage('Error al enviar los datos: ' + result.message);
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor: ' + error.message);
      console.error('Error en saveDataToFirestore:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Datos Personales
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="relative">
              <label htmlFor="firstName" className="text-gray-600">
                Nombre
              </label>
              <div className="flex items-center mt-1">
                <AiOutlineUser className="text-gray-400 mr-2" size={24} />
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                  placeholder="Ingrese su nombre"
                  required
                  pattern="[A-Za-z\s]+"
                  title="Solo se permiten letras y espacios"
                />
              </div>
            </div>
            {/* Apellidos */}
            <div className="relative">
              <label htmlFor="lastName" className="text-gray-600">
                Apellidos
              </label>
              <div className="flex items-center mt-1">
                <AiOutlineUser className="text-gray-400 mr-2" size={24} />
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                  placeholder="Ingrese sus apellidos"
                  required
                  pattern="[A-Za-z\s]+"
                  title="Solo se permiten letras y espacios"
                />
              </div>
            </div>
          </div>
          {/* Fecha de Nacimiento */}
          <div className="relative">
            <label htmlFor="birthDate" className="text-gray-600">
              Fecha de Nacimiento
            </label>
            <div className="flex items-center mt-1">
              <BsCalendar className="text-gray-400 mr-2" size={24} />
              <input
                type="date"
                name="birthDate"
                id="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                required
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          {/* País */}
          <div className="relative">
            <label htmlFor="country" className="text-gray-600">
              País
            </label>
            <select
              name="country"
              id="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none bg-transparent py-1 mt-1 transition-colors duration-300 ease-in-out"
              required
            >
              <option value="" disabled>
                Seleccione su país
              </option>
              <option value="Bolivia">Bolivia +591</option>
              <option value="Argentina">Argentina +54</option>
              <option value="Chile">Chile +56</option>
              <option value="Brasil">Brasil +55</option>
              <option value="Colombia">Colombia +57</option>
              <option value="Peru">Perú +51</option>
              <option value="Mexico">México +52</option>
              <option value="United States">Estados Unidos +1</option>
            </select>
          </div>
          {/* Nivel Académico */}
          <div className="relative">
            <label htmlFor="academicLevel" className="text-gray-600">
              Nivel Académico
            </label>
            <select
              name="academicLevel"
              id="academicLevel"
              value={formData.academicLevel}
              onChange={handleChange}
              className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none bg-transparent py-1 mt-1 transition-colors duration-300 ease-in-out"
              required
            >
              <option value="" disabled>
                Seleccione su nivel académico
              </option>
              <option value="Student">Estudiante Universitario</option>
              <option value="Professional">Profesional</option>
            </select>
          </div>
          {/* Campos adicionales según nivel académico */}
          {formData.academicLevel === 'Professional' && (
            <>
              {/* Nombre de la Empresa */}
              <div className="relative">
                <label htmlFor="companyName" className="text-gray-600">
                  Nombre de la Empresa
                </label>
                <div className="flex items-center mt-1">
                  <BsBuilding className="text-gray-400 mr-2" size={24} />
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                    placeholder="Ingrese el nombre de la empresa"
                    required
                    pattern="[A-Za-z\s]+"
                    title="Solo se permiten letras y espacios"
                  />
                </div>
              </div>
              {/* Profesión */}
              <div className="relative">
                <label htmlFor="profession" className="text-gray-600">
                  Profesión
                </label>
                <div className="flex items-center mt-1">
                  <AiOutlineUser className="text-gray-400 mr-2" size={24} />
                  <input
                    type="text"
                    name="profession"
                    id="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                    placeholder="Ingrese su profesión"
                    required
                    pattern="[A-Za-z\s]+"
                    title="Solo se permiten letras y espacios"
                  />
                </div>
              </div>
            </>
          )}
          {formData.academicLevel === 'Student' && (
            <>
              {/* Nombre de la Universidad */}
              <div className="relative">
                <label htmlFor="universityName" className="text-gray-600">
                  Nombre de la Universidad
                </label>
                <div className="flex items-center mt-1">
                  <FaUniversity className="text-gray-400 mr-2" size={24} />
                  <input
                    type="text"
                    name="universityName"
                    id="universityName"
                    value={formData.universityName}
                    onChange={handleChange}
                    className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                    placeholder="Ingrese el nombre de la universidad"
                    required
                    pattern="[A-Za-z\s]+"
                    title="Solo se permiten letras y espacios"
                  />
                </div>
              </div>
              {/* Subir Carnet de Estudiante */}
              <div className="relative">
                <label htmlFor="studentId" className="text-gray-600">
                  Subir Carnet de Estudiante
                </label>
                <div className="flex items-center mt-1">
                  <FaRegIdBadge className="text-gray-400 mr-2" size={24} />
                  <input
                    type="file"
                    name="studentId"
                    id="studentId"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full text-gray-900 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                    required
                  />
                </div>
              </div>
            </>
          )}
          {/* Correo Electrónico */}
          <div className="relative">
            <label htmlFor="email" className="text-gray-600">
              Correo Electrónico
            </label>
            <div className="flex items-center mt-1">
              <AiOutlineMail className="text-gray-400 mr-2" size={24} />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                placeholder="Ingrese su correo electrónico"
                required
              />
            </div>
          </div>
          {/* Teléfono */}
          <div className="relative">
            <label htmlFor="phone" className="text-gray-600">
              Nº de Teléfono/Celular
            </label>
            <div className="flex items-center mt-1">
              <AiOutlinePhone className="text-gray-400 mr-2" size={24} />
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-300 focus:border-green-600 focus:outline-none py-1 transition-colors duration-300 ease-in-out"
                placeholder="Ingrese su número de teléfono"
                required
                pattern="\d{8,10}"
                title="Debe tener 8 o 10 dígitos"
              />
            </div>
          </div>
          {/* Botón Enviar */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              {loading ? <ClipLoader size={20} color="#ffffff" /> : 'Enviar'}
            </button>
          </div>
        </form>
        {message && (
          <div className="mt-8 bg-green-100 text-green-800 p-4 rounded-lg">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDataForm;
