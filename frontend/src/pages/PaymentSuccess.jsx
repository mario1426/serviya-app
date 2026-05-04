import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../services/api';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const externalRef = params.get('external_reference');

  useEffect(() => {
    // Verificar el pago en el backend
    if (externalRef) {
      api.get(`/payments/status/${externalRef}`).catch(() => {});
    }
  }, [externalRef]);

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-navy mb-2">¡Pago exitoso!</h2>
        <p className="text-gray-medium text-sm mb-6">
          Tu pago fue procesado correctamente. El trabajador recibirá su pago en breve.
        </p>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6">
          <p className="text-green-700 text-sm font-medium">Gracias por usar ServiYa 💚</p>
        </div>
        <button onClick={() => navigate('/home')} className="btn-primary w-full">
          Volver al inicio
        </button>
        <button onClick={() => navigate('/history')} className="w-full text-gray-medium text-sm mt-3 hover:underline">
          Ver mis servicios
        </button>
      </div>
    </div>
  );
}
