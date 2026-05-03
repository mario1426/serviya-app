import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const SERVICES = [
  { icon: '🔧', name: 'Plomería' },
  { icon: '⚡', name: 'Electricidad' },
  { icon: '🌱', name: 'Jardinería' },
  { icon: '🌿', name: 'Corte de pasto' },
  { icon: '🚗', name: 'Lavado de autos' },
  { icon: '👕', name: 'Lavandería' },
  { icon: '💇', name: 'Peluquería' },
  { icon: '🐾', name: 'Mascotas' },
  { icon: '🚕', name: 'Viajes' },
  { icon: '🏠', name: 'Reparaciones' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isWorker } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isWorker ? '/worker/dashboard' : '/home');
    }
  }, [isAuthenticated, isWorker, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-primary">Servi</span>
          <span className="text-2xl font-bold text-navy">Ya</span>
          <span className="text-xl ml-0.5">🚀</span>
        </div>
        <button onClick={() => navigate('/login')} className="btn-primary py-2 px-5 text-sm">
          Ingresar
        </button>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-navy-dark text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Los mejores servicios,<br />
          <span className="text-primary-light">en tu puerta</span>
        </h1>
        <p className="text-blue-200 mb-8 text-lg">
          Conectamos profesionales verificados con vos en minutos. Todo Argentina.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/login')} className="btn-primary text-lg py-4 px-8">
            Contratar servicio
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-white/10 border border-white/30 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-colors"
          >
            Ofrecer servicios
          </button>
        </div>
      </section>

      {/* Servicios */}
      <section className="px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-navy mb-8">¿Qué necesitás hoy?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
          {SERVICES.map((s) => (
            <button
              key={s.name}
              onClick={() => navigate('/login')}
              className="card flex flex-col items-center gap-2 p-4 hover:shadow-md hover:border hover:border-primary/20 transition-all cursor-pointer"
            >
              <span className="text-3xl">{s.icon}</span>
              <span className="text-sm font-medium text-gray-dark text-center">{s.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-gray-light px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-navy mb-10">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step: '1', title: 'Elegí el servicio', desc: 'Buscá lo que necesitás y encontrá profesionales cercanos.' },
            { step: '2', title: 'Contactá al trabajador', desc: 'Chatear, acordar precio y programar la visita.' },
            { step: '3', title: 'Listo y calificá', desc: 'Pagá seguro y dejá tu reseña para ayudar a la comunidad.' },
          ].map((item) => (
            <div key={item.step} className="card text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-navy mb-2">{item.title}</h3>
              <p className="text-sm text-gray-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Próximamente en tiendas */}
      <section className="px-6 py-12 text-center bg-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Muy pronto</p>
        <h2 className="text-2xl font-bold text-navy mb-2">ServiYa en tu celular</h2>
        <p className="text-gray-medium text-sm mb-8">
          Descargá la app y gestioná tus servicios desde cualquier lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Google Play */}
          <div className="flex items-center gap-3 bg-black text-white rounded-2xl px-5 py-3 w-52 opacity-80 cursor-not-allowed select-none">
            <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="currentColor">
              <path d="M3.18 23.76c.3.17.64.24.99.2l12.6-11.6-3.32-3.32L3.18 23.76zM.54 1.96C.2 2.37 0 2.94 0 3.67v16.66c0 .73.2 1.3.54 1.71l.09.09 9.33-9.33v-.22L.63 1.87l-.09.09zM20.3 10.37l-2.66-1.54-3.72 3.72 3.72 3.72 2.68-1.55c.76-.44.76-1.91-.02-2.35zM4.17.24l12.6 11.6-3.32 3.32L3.18.28c.3-.04.64.03.99.2-.02-.08 0-.16 0-.24z"/>
            </svg>
            <div className="text-left">
              <p className="text-xs opacity-70 leading-none">Próximamente en</p>
              <p className="text-base font-semibold leading-tight">Google Play</p>
            </div>
          </div>
          {/* App Store */}
          <div className="flex items-center gap-3 bg-black text-white rounded-2xl px-5 py-3 w-52 opacity-80 cursor-not-allowed select-none">
            <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <p className="text-xs opacity-70 leading-none">Próximamente en</p>
              <p className="text-base font-semibold leading-tight">App Store</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-blue-400">Servi</span>
            <span className="text-xl font-bold text-white">Ya</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Términos y condiciones</button>
            <span className="text-white/30">·</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Política de privacidad</button>
            <span className="text-white/30">·</span>
            <button onClick={() => navigate('/support')} className="hover:text-white transition-colors">Soporte</button>
            <span className="text-white/30">·</span>
            <a href="mailto:ojedamario911@gmail.com" className="hover:text-white transition-colors">ojedamario911@gmail.com</a>
          </div>
          <p className="text-white/40 text-xs">© 2025 ServiYa — Servicios a domicilio en toda Argentina</p>
        </div>
      </footer>
    </div>
  );
}
