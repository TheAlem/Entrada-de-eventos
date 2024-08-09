import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from 'react-modal';
import axios from 'axios';

const QRScanner = () => {
    const [qrCodeResult, setQrCodeResult] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState('Acerque el QR para escanear');
    const [isScanning, setIsScanning] = useState(false);
    const qrRef = useRef(null);
    const qrScanner = useRef(null);

    useEffect(() => {
        Modal.setAppElement('#root');
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        if (qrRef.current && !qrScanner.current) {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    qrScanner.current = new Html5Qrcode(qrRef.current.id);
                    const config = { 
                        fps: 10, 
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        disableFlip: false,
                        videoConstraints: {
                            facingMode: { ideal: "environment" }
                        }
                    };
                    await qrScanner.current.start(
                        { facingMode: "environment" },
                        config,
                        onScanSuccess,
                        onScanFailure
                    );
                    setIsScanning(true);
                    setModalContent('Escaneando... Acerque el QR a la cámara');
                    setModalIsOpen(true);
                } else {
                    throw new Error("No se encontraron cámaras disponibles");
                }
            } catch (err) {
                console.error("Error al iniciar el escáner QR: ", err);
                setModalContent(`Error al iniciar el escaneo: ${err.message}`);
                setModalIsOpen(true);
            }
        }
    };

    const stopScanner = () => {
        if (qrScanner.current && qrScanner.current.isScanning) {
            qrScanner.current.stop().then(() => {
                console.log('Escaneo QR detenido.');
                qrScanner.current = null;
                setIsScanning(false);
                setModalContent('Escaneo detenido');
                setModalIsOpen(true);
            }).catch(err => console.error('Error al detener el escáner QR', err));
        }
    };

    const onScanSuccess = async (decodedText, decodedResult) => {
        let qrData;
        try {
          try {
            qrData = JSON.parse(decodedText);
            console.log('QR contiene un JSON válido:', qrData);
          } catch (error) {
            qrData = decodedText;
            console.log('QR contiene texto plano:', qrData);
          }

          const response = await axios.post('https://us-central1-energiaboliviappandroid.cloudfunctions.net/verifyQr', { token: qrData.token }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          

          if (response.data.valid) {
            setQrCodeResult(JSON.stringify(qrData, null, 2));
            setModalContent(`QR válido: ${JSON.stringify(qrData, null, 2)}`);
          } else {
            setQrCodeResult('QR inválido o ya escaneado');
            setModalContent('QR inválido o ya escaneado');
          }
        } catch (error) {
          console.error('Error procesando el QR:', error);
          setQrCodeResult(decodedText);
          setModalContent(`Error procesando el QR: ${error.message}`);

          // Intenta de nuevo si hay un error de red
          if (error.code === 'ERR_NETWORK') {
            try {
              const response = await axios.post('https://us-central1-energiaboliviappandroid.cloudfunctions.net/verifyQr', { token: qrData.token }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              });
              if (response.data.valid) {
                setQrCodeResult(JSON.stringify(qrData, null, 2));
                setModalContent(`QR válido: ${JSON.stringify(qrData, null, 2)}`);
              } else {
                setQrCodeResult('QR inválido o ya escaneado');
                setModalContent('QR inválido o ya escaneado');
              }
            } catch (retryError) {
              console.error('Error al volver a intentar:', retryError);
              setQrCodeResult(decodedText);
              setModalContent(`Error procesando el QR: ${retryError.message}`);
            }
          }
        }
        setModalIsOpen(true);
        stopScanner();
      };

    const onScanFailure = (error) => {
        console.log(`Fallo en escaneo = ${error}`);
    };


    return (
        <div className="flex flex-col items-center justify-center p-4 mt-16 ">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Escáner QR</h2>
                <div className="flex justify-center space-x-4 mb-4">
                    <button
                        className={`px-4 py-2 rounded-full font-semibold text-white ${isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                        onClick={startScanner}
                        disabled={isScanning}
                    >
                        Iniciar Escaneo
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full font-semibold text-white ${!isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                        onClick={stopScanner}
                        disabled={!isScanning}
                    >
                        Detener Escaneo
                    </button>
                </div>
                <div ref={qrRef} id="qr-reader" className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden"></div>
                <p className="text-sm mt-4 text-center text-gray-600">
                    Resultado del escaneo: <pre className="font-semibold whitespace-pre-wrap break-words">{qrCodeResult || 'Ninguno'}</pre>
                </p>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Resultado del Escaneo"
                className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
            >
                <h2 className="text-xl font-bold mb-4 text-green-600">Resultado del Escaneo</h2>
                <div className="text-gray-700 mb-4 whitespace-pre-wrap break-words">{modalContent}</div>
                <button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
                    onClick={() => setModalIsOpen(false)}
                >
                    Cerrar
                </button>
            </Modal>
        </div>
    );
};

export default QRScanner;
