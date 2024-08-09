import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleScroll = () => {
        const offset = window.scrollY;
        setIsScrolled(offset > 100);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navbarClass = `fixed top-0 left-0 right-0 z-50 transition duration-300 ease-in-out 
        bg-white bg-opacity-20 backdrop-blur-lg shadow-md
        ${isScrolled ? 'py-2' : 'py-4'}`;

    const linkClass = `hover:text-green-500 transition duration-300 ease-in-out transform hover:-translate-y-1
        ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-800'}`;

    return (
        <nav className={navbarClass}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="text-2xl font-extrabold">
                    <Link to="/" className={linkClass}>Evento de Blockchain</Link>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link to="/personal-data" className={linkClass}>Datos Personales</Link>
                    <Link to="/payment" className={linkClass}>Pago</Link>
                    <Link to="/entry" className={linkClass}>Entrada</Link>
                    <Link to="/login" className={`${linkClass} flex items-center`}>
                        <FaUserCircle className="text-2xl" />
                    </Link>
                </div>
                <div className="md:hidden flex items-center">
                    <button onClick={toggleMobileMenu} className={`focus:outline-none ${linkClass}`}>
                        {isMobileMenuOpen ? <FaTimes className="text-2xl animate-spin" /> : <FaBars className="text-2xl animate-fade-in" />}
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white bg-opacity-90 backdrop-blur-lg shadow-lg rounded-lg mt-2 animate-slide-down">
                    <Link to="/personal-data" className="block text-gray-800 hover:text-green-500 px-4 py-2" onClick={toggleMobileMenu}>Datos Personales</Link>
                    <Link to="/payment" className="block text-gray-800 hover:text-green-500 px-4 py-2" onClick={toggleMobileMenu}>Pago</Link>
                    <Link to="/entry" className="block text-gray-800 hover:text-green-500 px-4 py-2" onClick={toggleMobileMenu}>Entrada</Link>
                    <Link to="/login" className="block text-gray-800 hover:text-green-500 px-4 py-2 flex items-center" onClick={toggleMobileMenu}>
                        <FaUserCircle className="text-2xl mr-2" /> Login
                    </Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;