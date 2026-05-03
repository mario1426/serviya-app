import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Support() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.post('/support', form);
      setSent(true);
    } catch (err) {
      setError('No se pudo enviar el mensaje. Intentá de nuevo o escribinos directamente al email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-medium hover:text-navy">
            ←
          </button>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-primary">Servi</span>
            <span className="text-xl font-bold text-navy">Ya</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="card text-center">
          <p className="text-4xl mb-2">🛟</p>
          <h1 className="text-2xl font-bold text-navy mb-1">Centro de Soporte</h1>
          <p className="text-sm text-gray-medium">Estamos para ayudarte. Respondemos en menos de 24 horas.</p>
        </div>

        {/* FAQ */}
        <div className="card space-y-4">
          <h2 className="font-bold text-navy">Preguntas frecuentes</h2>

          {[
            { q: '¿Cómo contrato un servicio?', a: 'Elegí la categoría que necesitás, seleccioná un trabajador disponible cerca tuyo y enviá tu solicitud. El trabajador te confirmará en minutos.' },
            { q: '¿Cómo me registro como trabajador?', a: 'Al crear tu cuenta elegís el rol "Trabajador". Luego completás tu perfil con tus servicios, zona y precio. Podés verificar tu identidad para generar más confianza.' },
            { q: '¿Cómo funciona el pago?', a: 'El pago se acuerda directamente entre el cliente y el trabajador. Próximamente integraremos Mercado Pago para mayor seguridad.' },
            { q: '¿Puedo cancelar un servicio?', a: 'Sí, podés cancelar desde el detalle del servicio. Las cancelaciones reiteradas pueden afectar tu calificación.' },
            { q: '¿Cómo cambio de modo cliente a trabajador?', a: 'Desde el header de la app, encontrás un botón para cambiar de modo. La misma cuenta te permite operar como cliente y trabajador.' },
          ].map((item, i) => (
            <details key={i} className="group border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <summary className="font-medium text-navy cursor-pointer list-none flex justify-between items-center">
                {item.q}
                <span className="text-gray-medium group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-gray-dark mt-2 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>

        {/* Formulario de contacto */}
        {sent ? (
          <div className="card text-center py-8">
            <p className="text-4xl mb-3">✅</p>
            <h2 className="font-bold text-navy text-lg mb-1">Mensaje enviado</h2>
            <p className="text-sm text-gray-medium mb-4">Te respondemos en menos de 24 horas a tu email.</p>
            <button onClick={() => navigate(-1)} className="btn-primary">Volver</button>
          </div>
        ) : (
          <div className="card">
            <h2 className="font-bold text-navy mb-4">Contactanos</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-medium mb-1 block">Nombre</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="input-field w-full"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-medium mb-1 block">Asunto</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="input-field w-full"
                  required
                >
                  <option value="">Seleccioná un asunto</option>
                  <option value="Problema con mi cuenta">Problema con mi cuenta</option>
                  <option value="Problema con un servicio">Problema con un servicio</option>
                  <option value="Verificación de identidad">Verificación de identidad</option>
                  <option value="Pagos y cobros">Pagos y cobros</option>
                  <option value="Reportar un usuario">Reportar un usuario</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-medium mb-1 block">Mensaje</label>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="input-field w-full h-28 resize-none"
                  placeholder="Describí tu consulta con el mayor detalle posible..."
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-50">
                {sending ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-medium">También podés escribirnos directo a</p>
              <a href="mailto:serviyaaplicacion@gmail.com" className="text-sm font-medium text-primary">
                serviyaaplicacion@gmail.com
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
