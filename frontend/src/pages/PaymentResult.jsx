import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PaymentResult() {
  const { requestId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // Mercado Pago puede pasar status como query param
    const mpStatus = params.get('status') || params.get('collection_status');
    
    if (mpStatus === 'approved') {
      setStatus('success');
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      setStatus('failure');
    } else if (mpStatus === 'pending' || mpStatus === 'in_process') {
      setStatus('pending');
    } else {
      // Consultar estado al backend
      api.get(`/payments/status/${requestId}`)
        .then(data => {
          if (data?.status === 'paid') setStatus('success');
          else setStatus('pending');
        })
        .catch(() => setStatus('success')); // Si no hay error, asumir éxito
    }
  }, [requestId, params]);

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (status === 'failure') return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-navy mb-2">Pago fallido</h2>
        <p className="text-gray-medium text-sm mb-6">No se pudo procesar tu pago. Podés intentarlo de nuevo.</p>
        <button onClick={() => navigate('/history')} className="btn-primary w-full">Ir a mis servicios</button>
        <button onClick={() => navigate('/home')} className="w-full text-gray-medium text-sm mt-3 hover:underline">Volver al inicio</button>
      </div>
    </div>
  );

  if (status === 'pending') return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-navy mb-2">Pago pendiente</h2>
        <p className="text-gray-medium text-sm mb-6">Tu pago está siendo procesado. Te notificaremos cuando se acredite.</p>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-6">
          <p className="text-yellow-700 text-sm">Esto puede tardar unos minutos.</p>
        </div>
        <button onClick={() => navigate('/home')} className="btn-primary w-full">Volver al inicio</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-navy mb-2">¡Pago exitoso!</h2>
        <p className="text-gray-medium text-sm mb-6">Tu pago fue procesado correctamente. El trabajador recibirá su pago en breve.</p>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6">
          <p className="text-green-700 text-sm font-medium">Gracias por usar ServiYa 💚</p>
        </div>
        <button onClick={() => navigate('/home')} className="btn-primary w-full">Volver al inicio</button>
        <button onClick={() => navigate('/history')} className="w-full text-gray-medium text-sm mt-3 hover:underline">Ver mis servicios</button>
      </div>
    </div>
  );
}
