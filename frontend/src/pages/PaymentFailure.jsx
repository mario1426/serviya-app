import { useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-navy mb-2">Pago fallido</h2>
        <p className="text-gray-medium text-sm mb-6">
          No se pudo procesar tu pago. Podés intentarlo de nuevo desde tu historial de servicios.
        </p>
        <button onClick={() => navigate('/history')} className="btn-primary w-full">
          Ir a mis servicios
        </button>
        <button onClick={() => navigate('/home')} className="w-full text-gray-medium text-sm mt-3 hover:underline">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
