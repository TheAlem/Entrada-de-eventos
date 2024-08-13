import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from 'react-modal';
import axios from 'axios';

const QRScanner = () => {
    const [qrCodeResult, setQrCodeResult] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState('Acerque el QR para escanear');
    const [isScanning, setIsScanning] = useState(false);
    const [hasScanned, setHasScanned] = useState(false); // Nueva bandera para evitar escaneos repetidos
    const qrRef = useRef(null);
    const qrScanner = useRef(null);

    useEffect(() => {
        Modal.setAppElement('#root');
        return () => {
            if (qrScanner.current) {
                qrScanner.current.stop();
            }
        };
    }, []);

    const startScanner = async () => {
        if (!qrScanner.current && !hasScanned) { // Solo iniciar el escáner si no ha escaneado
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices.length) {
                    qrScanner.current = new Html5Qrcode(qrRef.current.id);
                    const config = {
                        fps: 15,
                        qrbox: { width: 300, height: 300 },
                        aspectRatio: 1.0
                    };
                    await qrScanner.current.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure);
                    setIsScanning(true);
                    setModalContent('Escaneando... Acerque el QR a la cámara');
                    setModalIsOpen(true);
                } else {
                    throw new Error("No se encontraron cámaras.");
                }
            } catch (err) {
                setModalContent(`Error del escáner: ${err.message}`);
                setModalIsOpen(true);
            }
        }
    };

    const stopScanner = () => {
        if (qrScanner.current) {
            qrScanner.current.stop().then(() => {
                qrScanner.current = null;
                setIsScanning(false);
                setHasScanned(false); // Permitir escanear nuevamente después de detener
                setModalContent('Escaneo detenido');
                setModalIsOpen(true);
            }).catch(err => {
                setModalContent(`Error al detener el escáner: ${err.message}`);
                setModalIsOpen(true);
            });
        }
    };

    const onScanSuccess = async (decodedText, decodedResult) => {
        if (hasScanned) {
            setModalContent('QR ya ha sido escaneado. Por favor, espere.');
            setModalIsOpen(true);
            return;
        }

        setHasScanned(true); // Marcar como escaneado
        try {
            const qrData = JSON.parse(decodedText);
            const response = await axios.post('https://us-central1-energiaboliviappandroid.cloudfunctions.net/VerifyQr-verifyQr', { token: qrData.token }, { headers: { 'Content-Type': 'application/json' }});
            if (response.data) {
                setQrCodeResult(JSON.stringify(response.data, null, 2));
                setModalContent(`QR válido: ${response.data.message}`);
            }
        } catch (error) {
            let errorMessage = `Error en la solicitud: ${error.message}`;
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            setModalContent(errorMessage);
            setModalIsOpen(true);
        }
        stopScanner();
    };

    const onScanFailure = error => {
        if (error.includes("No MultiFormat Readers were able to detect the code")) {
            console.log(`Fallo controlado en el escaneo: ${error}`);
        } else {
            console.log(`Fallo en el escaneo: ${error}`);
            setModalContent(`Fallo en el escaneo: ${error}. Ajuste y vuelva a intentar.`);
            setModalIsOpen(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-16">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Escáner QR</h2>
                <div className="flex justify-center space-x-4 mb-4">
                    <button className={`px-4 py-2 rounded-full font-semibold text-white ${isScanning ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`} onClick={startScanner} disabled={isScanning || hasScanned}>
                        Iniciar Escaneo
                    </button>
                    <button className={`px-4 py-2 rounded-full font-semibold text-white ${!isScanning ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`} onClick={stopScanner} disabled={!isScanning}>
                        Detener Escaneo
                    </button>
                </div>
                <div ref={qrRef} id="qr-reader" className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden"></div>
                <p className="text-sm mt-4 text-center text-gray-600">Resultado del escaneo: <pre className="font-semibold whitespace-pre-wrap break-words">{qrCodeResult || 'Ninguno'}</pre></p>
            </div>
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} contentLabel="Resultados del Escaneo" className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-auto mt-20" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start">
                <h2 className="text-xl font-bold mb-4 text-green-600">Resultados del Escaneo</h2>
                <div className="text-gray-700 mb-4 whitespace-pre-wrap break-words">{modalContent}</div>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300" onClick={() => setModalIsOpen(false)}>
                    Cerrar
                </button>
            </Modal>
        </div>
    );
};

export default QRScanner;
