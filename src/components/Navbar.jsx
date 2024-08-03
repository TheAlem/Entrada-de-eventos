import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

function Navbar() {
    return (
        <nav className="bg-white shadow-md fixed top-0 left-0 right-0 backdrop-blur-lg bg-opacity-20 rounded-b-lg z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-2xl font-extrabold text-gray-800">
                    <Link to="/" className="hover:text-blue-600 transition duration-300">Evento de Blockchain</Link>
                </div>
                <div className="flex space-x-6">
                    <Link to="/personal-data" className="text-gray-800 hover:text-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Datos Personales</Link>
                    <Link to="/payment" className="text-gray-800 hover:text-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Pago</Link>
                    <Link to="/entry" className="text-gray-800 hover:text-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Entrada</Link>
                    <Link to="/login" className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1">
                        <FaUserCircle className="text-2xl" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
