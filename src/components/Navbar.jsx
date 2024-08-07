import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-white shadow-md fixed top-0 left-0 right-0 backdrop-blur-lg bg-opacity-20 rounded-b-lg z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-2xl font-extrabold text-gray-800">
                    <Link to="/" className="hover:text-green-600 transition duration-300">Evento de Blockchain</Link>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link to="/personal-data" className="text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Datos Personales</Link>
                    <Link to="/payment" className="text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Pago</Link>
                    <Link to="/entry" className="text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Entrada</Link>
                    <Link to="/login" className="flex items-center text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">
                        <FaUserCircle className="text-2xl" />
                    </Link>
                </div>
                <div className="md:hidden flex items-center">
                    <button onClick={toggleMobileMenu} className="text-gray-800 focus:outline-none">
                        {isMobileMenuOpen ? <FaTimes className="text-2xl animate-spin" /> : <FaBars className="text-2xl animate-fade-in" />}
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white bg-opacity-80 backdrop-blur-lg shadow-lg rounded-lg mt-2 animate-slide-down">
                    <Link to="/personal-data" className="block text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2" onClick={toggleMobileMenu}>Datos Personales</Link>
                    <Link to="/payment" className="block text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2" onClick={toggleMobileMenu}>Pago</Link>
                    <Link to="/entry" className="block text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2" onClick={toggleMobileMenu}>Entrada</Link>
                    <Link to="/login" className="block text-gray-800 hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2 flex items-center" onClick={toggleMobileMenu}>
                        <FaUserCircle className="text-2xl mr-2" /> Login
                    </Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
