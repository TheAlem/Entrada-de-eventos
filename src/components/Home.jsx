import React from 'react';
import { Link } from 'react-router-dom';
import Step1 from '../assets/images/1.svg';
import Step2 from '../assets/images/2.svg';
import Step3 from '../assets/images/3.svg';
import endecorporation from '../assets/Sponsors/endecorporation.png';
import EnergiaBolivia from '../assets/Sponsors/EnergiaBolivia.png';
import luka from '../assets/Sponsors/Luka.png';
import repsol from '../assets/Sponsors/repsol.png';
import TotalEnergies from '../assets/Sponsors/totalenergies.svg';
import Toyota from '../assets/Sponsors/Toyota.svg';
import YPFB from '../assets/Sponsors/YPFB_Logo.svg';
import AgroToken from '../assets/Sponsors/Agro.svg';
import backgroundImage from '../assets/images/PlantaBK.jpg';

function Home() {
    return (
        <div>
            {/* Sección principal con diseño mejorado */}
            <div className="relative h-[60vh] bg-cover bg-center rounded-b-3xl overflow-hidden" style={{ backgroundImage: `url(${backgroundImage})`, marginTop: '-44px' }}>
    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-70"></div>
    <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
        <div className="glass-container p-4 sm:p-8 rounded-3xl text-center max-w-4xl mx-4 backdrop-blur-lg">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ backgroundColor: '#a60a25' }}>
                BOLIVIA BLOCKCHAIN SUMMIT
            </h1>
            <p className="text-sm sm:text-lg md:text-xl mb-6">
                Explora el futuro de la tecnología en nuestro evento exclusivo.
                Sigue los pasos para asegurar tu entrada.
            </p>
            <div className="flex justify-center items-center space-x-4 sm:space-x-8">
                <img src={EnergiaBolivia} alt="Energia Bolivia" className="h-8 sm:h-12 md:h-16 drop-shadow-glow" />
                <div className="h-12 w-px bg-white opacity-50"></div>
                <img src={AgroToken} alt="Otro logo" className="h-6 sm:h-9 md:h-10 drop-shadow-glow" />
            </div>
        </div>
    </div>
</div>


            {/* Resto del contenido */}
            <div className="container mx-auto px-4 py-12">
                {/* Pasos para la Compra de Entradas */}
                <section className="mb-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#183c33' }}>Proceso de Compra</h2>
                    <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
                        <StepCard 
                            image={Step1}
                            step="Paso 1"
                            description="Coloca tus datos personales"
                            link="/personal-data"
                        />
                        <StepCard 
                            image={Step2}
                            step="Paso 2"
                            description="Paga la entrada mediante QR"
                        />
                        <StepCard 
                            image={Step3}
                            step="Paso 3"
                            description="Obtienes tu entrada!!"
                        />
                    </div>
                </section>

                {/* Carrusel de Patrocinadores */}
                <section className="mb-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12"  style={{ color: '#183c33' }}>Nuestros Patrocinadores</h2>
                    <SponsorsCarousel />
                </section>

                {/* Sección de Videos */}
                <section className="space-y-16">
                    <VideoSection 
                        title="¿Cómo funciona Agrotoken?" 
                        videoId="YcyhMAr5L8w"
                    />
                    <VideoSection 
                        title="¿Cómo funciona Landtoken?" 
                        videoId="f88gpa3suHI"
                    />
                </section>
            </div>
        </div>
    );
}

function StepCard({ image, step, description, link }) {
    return (
        <Link to={link} className="flex flex-col items-center w-full md:w-80 bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <img src={image} alt={step} className="w-full h-60 object-contain mb-6"/>
            <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#183c33' }}>{step}</h3>
            <p className="text-center text-lg text-gray-600">{description}</p>
        </Link>
    );
}

function SponsorsCarousel() {
    const sponsors = [
        { src: endecorporation, alt: "Ende Corporation" },
        { src: EnergiaBolivia, alt: "Energia Bolivia" },
        { src: luka, alt: "Luka" },
        { src: repsol, alt: "Repsol" },
        { src: TotalEnergies, alt: "Total Energies" },
        { src: Toyota, alt: "Toyota" },
        { src: YPFB, alt: "YPFB" },
    ];
    
    return (
        <div className="bg-gradient-to-r py-10 rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: '#f0f0e3' }}>
            <div className="relative flex overflow-x-hidden">
                <div className="flex h-40 animate-marquee whitespace-nowrap">
                    {sponsors.concat(sponsors).map((sponsor, index) => (
                        <div key={index} className="flex items-center justify-center mx-6 w-32 md:mx-12 md:w-48 h-36">
                            <img
                                src={sponsor.src}
                                alt={sponsor.alt}
                                className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition duration-300 ease-in-out transform hover:scale-110"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function VideoSection({ title, videoId }) {
    return (
        <div className="rounded-xl shadow-lg p-4 md:p-8 mb-16" style={{ backgroundColor: '#f0f0e3' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-center  mb-4 md:mb-8" style={{ color: '#183c33' }}>{title}</h2>
            <div className="flex justify-center">
                <div className="w-full max-w-2xl md:max-w-4xl rounded-xl overflow-hidden shadow-xl">
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <iframe 
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;