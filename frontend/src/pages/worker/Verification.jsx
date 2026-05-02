import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function WorkerVerification() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const verif = user?.workerInfo?.verification;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);
    setError('');

    // En una implementación real, subirías las imágenes a Firebase Storage
    // Aquí simulamos el envío del estado de verificación
    try {
      await api.put('/users/worker-profile', {
        verification: { status: 'pending' },
      });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Verificación de identidad</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Estado actual */}
        <div className="card text-center">
          {verif?.status === 'verified' ? (
            <>
              <div className="text-5xl mb-3">✅</div>
              <h2 className="font-bold text-green-700 text-lg">Identidad verificada</h2>
              <p className="text-sm text-gray-medium mt-1">Tu perfil muestra el badge de verificación</p>
            </>
          ) : verif?.status === 'pending' ? (
            <>
              <div className="text-5xl mb-3">⏳</div>
              <h2 className="font-bold text-yellow-600 text-lg">En revisión</h2>
              <p className="text-sm text-gray-medium mt-1">Revisaremos tu documentación en 24-48 horas</p>
            </>
          ) : verif?.status === 'rejected' ? (
            <>
              <div className="text-5xl mb-3">❌</div>
              <h2 className="font-bold text-red-600 text-lg">Verificación rechazada</h2>
              <p className="text-sm text-gray-medium mt-1">Volvé a enviar los documentos</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">🔐</div>
              <h2 className="font-bold text-navy text-lg">Verificá tu identidad</h2>
              <p className="text-sm text-gray-medium mt-1">Los trabajadores verificados generan más confianza y reciben más solicitudes</p>
            </>
          )}
        </div>

        {/* Beneficios */}
        <div className="card">
          <h3 className="font-semibold text-navy mb-3">¿Por qué verificarse?</h3>
          {[
            '✓ Badge verificado en tu perfil',
            '✓ Mayor confianza de los clientes',
            '✓ Aparecer mejor posicionado',
            '✓ Acceso a más solicitudes',
          ].map(b => (
            <p key={b} className="text-sm text-gray-dark py-1">{b}</p>
          ))}
        </div>

        {/* Formulario (solo si no está verificado/pendiente) */}
        {!['verified', 'pending'].includes(verif?.status) && !success && (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h3 className="font-semibold text-navy">Enviá tus documentos</h3>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Foto del DNI (frente)</label>
              <input type="file" name="dni" accept="image/*" className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Selfie con el DNI</label>
              <input type="file" name="selfie" accept="image/*" className="input-field" required />
              <p className="text-xs text-gray-medium mt-1">Sostenés el DNI junto a tu cara</p>
            </div>

            {error && <p className="text-primary text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Enviar para revisión'}
            </button>
          </form>
        )}

        {success && (
          <div className="card text-center bg-green-50">
            <p className="text-green-700 font-semibold">✅ Documentos enviados</p>
            <p className="text-sm text-gray-medium mt-1">Te notificaremos el resultado en 24-48 horas</p>
          </div>
        )}
      </div>
    </div>
  );
}
