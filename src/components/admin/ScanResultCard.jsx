import React from 'react';

const ScanResultCard = ({ result }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mt-4">
            <h3 className="text-xl font-bold mb-4 text-green-600">Entrada Validada</h3>
            <div className="text-gray-700 mb-2">
                <span className="font-semibold">Mensaje:</span> {result.message}
            </div>
            <div className="text-gray-700 mb-2">
                <span className="font-semibold">Nombre:</span> {result.name}
            </div>
            <div className="text-gray-700 mb-2">
                <span className="font-semibold">Correo Electrónico:</span> {result.email}
            </div>
            <div className="text-gray-700 mb-2">
                <span className="font-semibold">Token:</span> {result.token}
            </div>
        </div>
    );
};

export default ScanResultCard;
