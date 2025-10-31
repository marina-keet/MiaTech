import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 fade-in-up">
              MiaTech
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 fade-in-up">
              Votre partenaire technologique pour des solutions digitales innovantes
            </p>
            <p className="text-lg mb-10 opacity-80 max-w-2xl mx-auto fade-in-up">
              Développement web & mobile, design UX/UI, branding et conseil technologique. 
              Transformez vos idées en réalité avec notre expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up">
              <a href="/services" className="btn-primary text-lg px-8 py-3">
                Découvrir nos services
              </a>
              <a href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nos Expertises
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des solutions sur mesure pour accompagner votre croissance digitale
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Développement Web</h3>
              <p className="text-gray-600 mb-6">
                Applications web modernes et performantes avec les dernières technologies
              </p>
              <a href="/services" className="text-primary-600 font-medium hover:text-primary-700">
                En savoir plus →
              </a>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 2v2h2v14a4 4 0 01-4 4H9a4 4 0 01-4-4V4h2V2h10zM7 6v12a2 2 0 002 2h6a2 2 0 002-2V6H7z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Applications Mobile</h3>
              <p className="text-gray-600 mb-6">
                Applications natives et cross-platform pour iOS et Android
              </p>
              <a href="/services" className="text-primary-600 font-medium hover:text-primary-700">
                En savoir plus →
              </a>
            </div>

            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Design UX/UI</h3>
              <p className="text-gray-600 mb-6">
                Expériences utilisateur intuitives et designs modernes
              </p>
              <a href="/services" className="text-primary-600 font-medium hover:text-primary-700">
                En savoir plus →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi choisir MiaTech ?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Expertise technique approfondie</h3>
                    <p className="text-gray-600">Plus de 5 ans d'expérience dans le développement d'applications web et mobile</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Suivi personnalisé</h3>
                    <p className="text-gray-600">Un accompagnement sur mesure avec un suivi en temps réel de vos projets</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Technologies modernes</h3>
                    <p className="text-gray-600">Utilisation des dernières technologies pour des solutions performantes et évolutives</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Démarrez votre projet</h3>
              <form className="space-y-4">
                <div>
                  <label className="label">Nom complet</label>
                  <input type="text" className="input" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="label">Type de projet</label>
                  <select className="input">
                    <option>Sélectionner un service</option>
                    <option>Site web</option>
                    <option>Application mobile</option>
                    <option>Design UX/UI</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input" rows={4} placeholder="Décrivez votre projet..."></textarea>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Demander un devis gratuit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à transformer vos idées en réalité ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Contactez-nous dès aujourd'hui pour discuter de votre projet et obtenir un devis personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/order" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
              Commander un service
            </a>
            <a href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
              Planifier un appel
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;