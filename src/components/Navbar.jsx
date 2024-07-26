import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="bg-white shadow-md fixed top-0 left-0 right-0 backdrop-blur-lg bg-opacity-20 rounded-b-lg z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-gray-800">
                    <Link to="/">Evento de Blockchain</Link>
                </div>
                <div className="flex space-x-4">
                    <Link to="/personal-data" className="text-gray-800 hover:text-gray-600">Datos Personales</Link>
                    <Link to="/payment" className="text-gray-800 hover:text-gray-600">Pago</Link>
                    <Link to="/entry" className="text-gray-800 hover:text-gray-600">Entrada</Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
