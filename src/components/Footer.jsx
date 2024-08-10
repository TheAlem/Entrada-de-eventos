import React from 'react';

function Footer() {
    return (
        <footer className="shadow-md border-t border-gray-700 py-8" style={{ backgroundColor: '#183c33' }}>
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-200 text-center md:text-left mb-4 md:mb-0">
                    <h2 className="text-xl font-bold">Evento de Blockchain</h2>
                    <p className="text-sm">© 2024 The Alem. Todos los derechos reservados.</p>
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-center md:text-left">
                    {/* Add any additional footer links or content here */}
                </div>
                <div className="flex space-x-4 mt-4 md:mt-0">
                    <a href="https://www.facebook.com/EnergiaBolivia" className="text-gray-300 hover:text-gray-400 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 2.01L14 2a4 4 0 00-4 4v4H6v4h4v8h4v-8h4l1-4h-5V6a1 1 0 011-1h4V2.01z" />
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/energiabolivia" className="text-gray-300 hover:text-gray-400 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                            <rect x="5" y="3" width="14" height="14" rx="3" strokeWidth="2"></rect>
                            <circle cx="12" cy="10" r="3.5" strokeWidth="2"></circle>
                            <circle cx="17" cy="6" r="1" strokeWidth="2"></circle>
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
