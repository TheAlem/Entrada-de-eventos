import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const token = localStorage.getItem('userToken');

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

    const navbarClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled || !isHomePage ? 'bg-white bg-opacity-80 shadow-md' : 'bg-transparent'}
        backdrop-filter backdrop-blur-lg ${isScrolled ? 'py-2' : 'py-4'} rounded-b-xl`;

    const linkClass = `relative group px-3 py-2 text-sm font-medium
        ${isHomePage && !isScrolled ? 'text-white mix-blend-difference' : 'text-gray-800'}
        transition duration-300 ease-in-out`;

    const underlineClass = `absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform scale-x-0 
        group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left`;

    const mobileMenuClass = `md:hidden fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-xl shadow-lg rounded-b-lg
        transition-transform duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} z-40`;

    const mobileLinkClass = `flex px-6 py-4 text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-300 ease-in-out`;

    const closeIconClass = `absolute top-4 right-4 text-gray-800 text-2xl cursor-pointer`;

    return (
        <nav className={navbarClass}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="text-2xl font-extrabold ">
                    <Link to="/" className={`${linkClass} font-logo`}>
                        MONKEYTICKS
                    </Link>
                </div>
                <div className="hidden md:flex space-x-4">
                    <Link to="/personal-data" className={linkClass}>
                        Datos Personales
                        <span className={underlineClass}></span>
                    </Link>
                    <Link to={`/payment/${token}`} className={linkClass}>
                        Pago
                        <span className={underlineClass}></span>
                    </Link>
                    <Link to={`/entry/${token}`} className={linkClass}>
                        Entrada
                        <span className={underlineClass}></span>
                    </Link>
                    <Link to="/login" className={`${linkClass} flex items-center`}>
                        <FaUserCircle className="text-xl mr-1" /> 
                    </Link>
                </div>
                <div className="md:hidden flex items-center">
                    <button onClick={toggleMobileMenu} className="focus:outline-none">
                        {isMobileMenuOpen ? (
                            <FaTimes className="text-2xl text-gray-800" />
                        ) : (
                            <FaBars className="text-2xl text-gray-800" />
                        )}
                    </button>
                </div>
            </div>
            <div className={mobileMenuClass}>
                {isMobileMenuOpen && (
                    <FaTimes className={closeIconClass} onClick={toggleMobileMenu} />
                )}
                <div className="mt-12 flex flex-col space-y-2 px-4">
                    <Link to="/personal-data" className={mobileLinkClass} onClick={toggleMobileMenu}>
                        Datos Personales
                    </Link>
                    <Link to={`/payment/${token}`} className={mobileLinkClass} onClick={toggleMobileMenu}>
                        Pago
                    </Link>
                    <Link to={`/entry/${token}`} className={mobileLinkClass} onClick={toggleMobileMenu}>
                        Entrada
                    </Link>
                    <Link to="/login" className={mobileLinkClass} onClick={toggleMobileMenu}>
                        <FaUserCircle className="text-xl mr-2" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
