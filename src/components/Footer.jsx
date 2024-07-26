import React from 'react';

function Footer() {
    return (
        <footer className="bg-gray-900 shadow-md border-t border-gray-700 py-8">    
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-200 text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Evento de Blockchain</h2>
            <p className="text-sm">© 2024 The Alem. Todos los derechos reservados.</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-center md:text-left">
            
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className=" text-gray-300  hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 2.01L14 2a4 4 0 00-4 4v4H6v4h4v8h4v-8h4l1-4h-5V6a1 1 0 011-1h4V2.01z" />
                </svg>
            </a>
            <a href="#" className=" text-gray-300  hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364a9 9 0 111.415-1.414l-1.415 1.414zm0 0L21 21m-5-11h.01" />
                </svg>
            </a>
            </div>
        </div>
        </footer>
    );
}

export default Footer;