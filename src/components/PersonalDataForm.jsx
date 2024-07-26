import React, { useState } from 'react';

function PersonalDataForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        comments: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('https://tu-backend-heroku.com/api/personal-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
            window.location.href = '/payment';
        } else {
            alert('Error al enviar los datos');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Datos Personales</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            required
                        >
                            <option value="">Selecciona tu país</option>
                            <option value="United States">Estados Unidos</option>
                            <option value="Canada">Canadá</option>
                            <option value="Mexico">México</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Argentina">Argentina</option>
                            <option value="Chile">Chile</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comentarios</label>
                        <textarea
                            id="comments"
                            name="comments"
                            rows={3}
                            value={formData.comments}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            placeholder="Opcional"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Enviar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PersonalDataForm;
