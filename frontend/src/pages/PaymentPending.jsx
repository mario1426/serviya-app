import { useNavigate } from 'react-router-dom';

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-navy mb-2">Pago pendiente</h2>
        <p className="text-gray-medium text-sm mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se acredite.
        </p>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-6">
          <p className="text-yellow-700 text-sm">Esto puede tardar unos minutos dependiendo del medio de pago.</p>
        </div>
        <button onClick={() => navigate('/home')} className="btn-primary w-full">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
