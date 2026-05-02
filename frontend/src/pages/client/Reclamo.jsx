import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const TIPOS = [
  { value: 'service', label: '🔧 El trabajador no cumplió con el servicio' },
  { value: 'payment', label: '💳 Problema con el pago o quiero un reembolso' },
  { value: 'user',    label: '🚫 El trabajador no se presentó' },
  { value: 'other',   label: '📝 Otro motivo' },
];

export default function Reclamo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');

  const [form, setForm] = useState({ type: 'service', subject: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      return setError('Completá todos los campos');
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/tickets', {
        requestId,
        type: form.type,
        subject: form.subject,
        description: form.description,
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
        <div className="card max-w-sm w-full text-center py-10">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-navy mb-2">Reclamo enviado</h2>
          <p className="text-gray-medium text-sm mb-6">
            Recibimos tu reclamo y lo vamos a revisar a la brevedad. Te contactaremos por email con la resolución.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 text-left mb-6">
            <p className="font-semibold mb-1">¿Qué pasa ahora?</p>
            <p>Nuestro equipo revisará tu caso en un plazo de <strong>24 a 48 hs hábiles</strong>. Si corresponde un reembolso, lo procesaremos automáticamente al medio de pago original.</p>
          </div>
          <button onClick={() => navigate('/history')} className="btn-primary w-full">
            Volver a mis servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Abrir reclamo</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Antes de continuar</p>
            <p>Si el servicio no fue realizado o hubo algún problema, podés abrir un reclamo y te devolveremos el dinero. Revisamos cada caso individualmente.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de reclamo */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-navy">¿Qué pasó?</h3>
            <div className="space-y-2">
              {TIPOS.map(t => (
                <label
                  key={t.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.type === t.value
                      ? 'border-primary bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={form.type === t.value}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-navy">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Asunto y descripción */}
          <div className="card space-y-3">
            <div>
              <label className="text-sm font-medium text-navy block mb-1">Asunto *</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="input-field"
                placeholder="Ej: El plomero no se presentó"
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy block mb-1">Descripción detallada *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
                rows={5}
                placeholder="Contanos con detalle qué sucedió, fecha y hora del servicio, qué acordaron con el trabajador, etc."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-primary text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Enviando reclamo...' : 'Enviar reclamo'}
          </button>
        </form>
      </div>
    </div>
  );
}
