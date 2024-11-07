import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer
      className="py-10 px-4 md:px-8 lg:px-16 text-gray-200"
      style={{ backgroundColor: '#183c33' }}
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">TRANSACHAIN</h2>
          <p className="text-sm">
            TRANSACHAIN es una plataforma líder en soluciones blockchain para transacciones seguras y eficientes.
          </p>
          <p className="text-sm">© 2024 TRANSACHAIN. Todos los derechos reservados.</p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Enlaces Rápidos</h3>
          <ul className="space-y-1">
            <li>
              <a href="/" className="hover:text-gray-400 transition-colors duration-200">
                Inicio
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-gray-400 transition-colors duration-200">
                Sobre Nosotros
              </a>
            </li>
            <li>
              <a href="/services" className="hover:text-gray-400 transition-colors duration-200">
                Servicios
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-gray-400 transition-colors duration-200">
                Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Síguenos</h3>
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/EnergiaBolivia"
              className="text-gray-200 hover:text-gray-400 transition-colors duration-200"
            >
              <FaFacebookF size={24} />
            </a>
            <a
              href="https://www.instagram.com/energiabolivia"
              className="text-gray-200 hover:text-gray-400 transition-colors duration-200"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://twitter.com/"
              className="text-gray-200 hover:text-gray-400 transition-colors duration-200"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://www.linkedin.com/"
              className="text-gray-200 hover:text-gray-400 transition-colors duration-200"
            >
              <FaLinkedinIn size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-8 pt-4">
        <p className="text-center text-sm">
          Desarrollado por{' '}
          <Link to={"/"} className="text-gray-100 hover:text-gray-300 transition-colors duration-200">
            TRANSACHAIN
            </Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
