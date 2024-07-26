import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

function PaymentQR() {
    const [paymentUrl, setPaymentUrl] = useState('');

    useEffect(() => {
        fetch('https://tu-backend-heroku.com/api/payment-qr')
        .then(response => response.json())
        .then(data => setPaymentUrl(data.paymentUrl));
    }, []);

    return (
        <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">QR para Pago</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            {paymentUrl && <QRCode value={paymentUrl} />}
        </div>
        </div>
    );
}

export default PaymentQR;
