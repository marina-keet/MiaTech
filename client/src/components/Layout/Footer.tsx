import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MT</span>
              </div>
              <span className="text-xl font-bold">MiaTech</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Votre partenaire technologique de confiance pour tous vos projets numériques. 
              Solutions web, applications mobiles, et conseil IT.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                🐙
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/web" className="text-gray-300 hover:text-white transition-colors">
                  Développement Web
                </Link>
              </li>
              <li>
                <Link to="/services/mobile" className="text-gray-300 hover:text-white transition-colors">
                  Apps Mobiles
                </Link>
              </li>
              <li>
                <Link to="/services/design" className="text-gray-300 hover:text-white transition-colors">
                  Design UI/UX
                </Link>
              </li>
              <li>
                <Link to="/services/consulting" className="text-gray-300 hover:text-white transition-colors">
                  Conseil IT
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="mr-2">📧</span>
                contact@miatech.com
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center">
                <span className="mr-2">📍</span>
                Paris, France
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2025 MiaTech. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;