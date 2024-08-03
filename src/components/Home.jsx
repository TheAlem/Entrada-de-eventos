import React from 'react';
import { Link } from 'react-router-dom';
import Step1 from '../assets/images/1.svg';
import Step2 from '../assets/images/2.svg';
import Step3 from '../assets/images/3.svg';

function Home() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-5xl font-bold text-gray-800 text-center mb-8">Bienvenido al Evento de Blockchain</h1>
            <p className="text-xl text-gray-600 text-center mb-12">Sigue los pasos para la compra de entradas del evento.</p>
            
            <div className="flex flex-wrap justify-center gap-16">
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
        </div>
    );
}

function StepCard({ image, step, description, link }) {
    return (
        <Link to={link} className="flex flex-col items-center w-80 transform transition duration-300 hover:-translate-y-3">
            <img src={image} alt={step} className="w-full h-80 object-contain mb-6 "/>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">{step}</h3>
            <p className="text-center text-xl text-gray-600">{description}</p>
        </Link>
    );
}

export default Home;
