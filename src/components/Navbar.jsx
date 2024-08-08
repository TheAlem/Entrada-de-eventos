import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleScroll = () => {
        const offset = window.scrollY;
        setIsScrolled(offset > 100); // Cambia el valor según la altura de tu imagen de fondo
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition duration-300 ease-in-out bg-transparent backdrop-blur-lg ${isScrolled ? 'text-black' : 'text-white'}`}>
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-2xl font-extrabold">
                    <Link to="/" className="hover:text-green-600 transition duration-300">Evento de Blockchain</Link>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link to="/personal-data" className="hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Datos Personales</Link>
                    <Link to="/payment" className="hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Pago</Link>
                    <Link to="/entry" className="hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">Entrada</Link>
                    <Link to="/login" className="flex items-center hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1">
                        <FaUserCircle className="text-2xl" />
                    </Link>
                </div>
                <div className="md:hidden flex items-center">
                    <button onClick={toggleMobileMenu} className="focus:outline-none">
                        {isMobileMenuOpen ? <FaTimes className="text-2xl animate-spin" /> : <FaBars className="text-2xl animate-fade-in" />}
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white bg-opacity-80 backdrop-blur-lg shadow-lg rounded-lg mt-2 animate-slide-down">
                    <Link to="/personal-data" className="block hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2" onClick={toggleMobileMenu}>Datos Personales</Link>
                    <Link to="/payment" className="block hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2" onClick={toggleMobileMenu}>Pago</Link>
                    <Link to="/entry" className="block hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2" onClick={toggleMobileMenu}>Entrada</Link>
                    <Link to="/login" className="block hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 px-4 py-2 flex items-center" onClick={toggleMobileMenu}>
                        <FaUserCircle className="text-2xl mr-2" /> 
                    </Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
