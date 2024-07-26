import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

    function EntryQR() {
    const [entryUrl, setEntryUrl] = useState('');

    useEffect(() => {
        fetch('https://tu-backend-heroku.com/api/entry-qr')
        .then(response => response.json())
        .then(data => setEntryUrl(data.entryUrl));
    }, []);

    return (
        <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Código QR para Entrada</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            {entryUrl && <QRCode value={entryUrl} />}
        </div>
        </div>
    );
}

export default EntryQR;
